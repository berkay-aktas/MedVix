"""Business logic for Step 3 — Data Preparation.

Implements the full data-preparation pipeline: missing-value handling,
target and feature encoding, train/test splitting, normalisation, and
optional SMOTE oversampling.
"""

from __future__ import annotations

import math
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, MinMaxScaler, StandardScaler

from app.models.preparation import (
    BeforeAfterColumn,
    ColumnStatsAfter,
    ColumnStatsBefore,
    NormalisationResult,
    PreparationConfig,
    PreparationResult,
    SmoteResult,
)
from app.models.session import SessionState
from app.utils.constants import IMBALANCE_THRESHOLD, MAX_TEST_SIZE, MIN_TEST_SIZE


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def prepare_data(
    session: SessionState,
    config: PreparationConfig,
) -> PreparationResult:
    """Run the full preparation pipeline on the session's DataFrame.

    1. Select feature + target columns from the session DataFrame
    2. Record *before* statistics per numeric column
    3. Handle missing values (median / mode / remove)
    4. Encode target with LabelEncoder
    5. One-hot encode categorical features
    6. Train/test split (stratified when possible)
    7. Normalise numeric features (zscore / minmax / none)
    8. SMOTE on training set if enabled and imbalance exists
    9. Record *after* statistics
    10. Store arrays on session and return summary

    Args:
        session: Current pipeline session with ``df``, ``target_column``,
                 and ``feature_columns`` already set.
        config:  User-selected preparation options.

    Returns:
        A fully populated ``PreparationResult``.
    """
    df = session.df.copy()
    target_col = session.target_column
    feature_cols = list(session.feature_columns)

    # ----- 1. Subset to selected columns -----
    selected_cols = feature_cols + [target_col]
    work = df[selected_cols].copy()

    rows_before = len(work)
    missing_before = int(work[feature_cols].isna().sum().sum())

    # ----- 2. Record BEFORE stats (numeric features only) -----
    before_stats = _compute_column_stats(work, feature_cols)

    # ----- 3. Handle missing values -----
    rows_removed = 0
    if config.missing_strategy == "median":
        for col in feature_cols:
            if work[col].isna().any():
                if pd.api.types.is_numeric_dtype(work[col]):
                    work[col] = work[col].fillna(work[col].median())
                else:
                    mode_vals = work[col].mode()
                    fill = mode_vals.iloc[0] if len(mode_vals) > 0 else "unknown"
                    work[col] = work[col].fillna(fill)

    elif config.missing_strategy == "mode":
        for col in feature_cols:
            if work[col].isna().any():
                mode_vals = work[col].mode()
                fill = mode_vals.iloc[0] if len(mode_vals) > 0 else (0 if pd.api.types.is_numeric_dtype(work[col]) else "unknown")
                work[col] = work[col].fillna(fill)

    elif config.missing_strategy == "remove":
        work = work.dropna(subset=feature_cols)
        rows_removed = rows_before - len(work)

    # Drop rows where target is NaN
    target_na_count = work[target_col].isna().sum()
    if target_na_count > 0:
        work = work.dropna(subset=[target_col])
        rows_removed += int(target_na_count)

    # Safety: fill any remaining NaN in features with 0
    work[feature_cols] = work[feature_cols].fillna(0)

    missing_after = int(work[feature_cols].isna().sum().sum())

    # ----- 4. Encode target -----
    le_target = LabelEncoder()
    y = le_target.fit_transform(work[target_col].astype(str))

    # ----- 5. One-hot encode categorical features -----
    X = work[feature_cols].copy()
    categorical_cols = [
        c for c in X.columns
        if not pd.api.types.is_numeric_dtype(X[c])
        and not pd.api.types.is_bool_dtype(X[c])
    ]
    if categorical_cols:
        X = pd.get_dummies(X, columns=categorical_cols, drop_first=False, dtype=float)

    feature_names_after_encoding = list(X.columns)
    feature_count = len(feature_names_after_encoding)

    # Record column names for normalisation tracking
    numeric_cols_for_norm = [
        c for c in X.columns if pd.api.types.is_numeric_dtype(X[c])
    ]

    # ----- 6. Train/test split -----
    X_np = X.values.astype(np.float64)
    y_np = np.array(y)

    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X_np,
            y_np,
            test_size=config.test_size,
            random_state=42,
            stratify=y_np,
        )
    except ValueError:
        # Stratification fails when a class has too few samples
        X_train, X_test, y_train, y_test = train_test_split(
            X_np,
            y_np,
            test_size=config.test_size,
            random_state=42,
        )

    # ----- 7. Normalise -----
    norm_sample_before: Dict[str, float] = {}
    norm_sample_after: Dict[str, float] = {}
    columns_normalised: List[str] = []

    if config.normalisation != "none" and X_train.shape[0] > 0:
        # Capture a before-normalisation sample (first row of train)
        for idx, col_name in enumerate(feature_names_after_encoding):
            norm_sample_before[col_name] = _safe_float_val(X_train[0, idx])

        if config.normalisation == "zscore":
            scaler = StandardScaler()
        else:
            scaler = MinMaxScaler()

        X_train = scaler.fit_transform(X_train)
        X_test = scaler.transform(X_test)
        columns_normalised = list(feature_names_after_encoding)

        # Capture after-normalisation sample
        for idx, col_name in enumerate(feature_names_after_encoding):
            norm_sample_after[col_name] = _safe_float_val(X_train[0, idx])

    normalisation_result = NormalisationResult(
        method=config.normalisation,
        columns_normalised=columns_normalised,
        sample_before=norm_sample_before,
        sample_after=norm_sample_after,
    )

    # ----- 8. SMOTE -----
    smote_before_dist = _class_dist(y_train)
    smote_applied = False
    synthetic_samples = 0

    if config.apply_smote:
        # Only apply if imbalance is detected
        unique_counts = np.unique(y_train, return_counts=True)
        total_train = len(y_train)
        minority_count = int(unique_counts[1].min())
        minority_ratio = minority_count / total_train if total_train > 0 else 1.0

        if minority_ratio < IMBALANCE_THRESHOLD:
            try:
                from imblearn.over_sampling import SMOTE as SmoteImpl

                # Adjust k_neighbors for small minority classes
                n_classes = len(unique_counts[0])
                min_class_size = int(unique_counts[1].min())
                k_neighbors = min(5, max(1, min_class_size - 1))

                sm = SmoteImpl(random_state=42, k_neighbors=k_neighbors)
                pre_count = len(X_train)
                X_train, y_train = sm.fit_resample(X_train, y_train)
                synthetic_samples = len(X_train) - pre_count
                smote_applied = True
            except Exception:
                # SMOTE failed (e.g., too few samples); continue without it
                pass

    smote_after_dist = _class_dist(y_train)

    smote_result = SmoteResult(
        applied=smote_applied,
        before_distribution=smote_before_dist,
        after_distribution=smote_after_dist,
        synthetic_samples=synthetic_samples,
    )

    # ----- 9. Record AFTER stats -----
    # Build a temporary DataFrame from X_train for stats
    after_df = pd.DataFrame(X_train, columns=feature_names_after_encoding)
    after_stats = _compute_column_stats(after_df, feature_names_after_encoding)

    # Build before/after pairs (only for columns present in both)
    before_after_stats: List[BeforeAfterColumn] = []
    for col_name in feature_names_after_encoding:
        b = before_stats.get(col_name)
        a = after_stats.get(col_name)
        if b is not None and a is not None:
            before_after_stats.append(
                BeforeAfterColumn(
                    column=col_name,
                    before=ColumnStatsBefore(**b),
                    after=ColumnStatsAfter(**a),
                )
            )

    # ----- 10. Store on session -----
    session.X_train = X_train
    session.X_test = X_test
    session.y_train = y_train
    session.y_test = y_test
    session.is_prepared = True
    session.preparation_config = config.model_dump()
    session.current_step = 4

    # ----- Build result -----
    train_rows = len(X_train)
    test_rows = len(X_test)

    success_parts = [
        f"Data prepared successfully.",
        f"{train_rows} training samples, {test_rows} test samples.",
        f"{feature_count} features after encoding.",
    ]
    if smote_applied:
        success_parts.append(
            f"SMOTE generated {synthetic_samples} synthetic training samples."
        )
    if config.normalisation != "none":
        success_parts.append(
            f"Features normalised using {config.normalisation}."
        )

    return PreparationResult(
        session_id=session.session_id,
        train_rows=train_rows,
        test_rows=test_rows,
        feature_count=feature_count,
        rows_removed=rows_removed,
        missing_before=missing_before,
        missing_after=missing_after,
        normalisation=normalisation_result,
        smote=smote_result,
        before_after_stats=before_after_stats,
        data_ready=True,
        success_message=" ".join(success_parts),
    )


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _compute_column_stats(
    df: pd.DataFrame,
    columns: List[str],
) -> Dict[str, Dict[str, Any]]:
    """Compute per-column min/max/mean/std/missing for numeric columns.

    Returns ``{column_name: {column, min, max, mean, std, missing}}``.
    Only includes columns that are numeric after potential encoding.
    """
    stats: Dict[str, Dict[str, Any]] = {}
    for col in columns:
        if col not in df.columns:
            continue
        series = df[col]
        if not pd.api.types.is_numeric_dtype(series):
            continue
        stats[col] = {
            "column": col,
            "min": _safe_float_val(series.min()),
            "max": _safe_float_val(series.max()),
            "mean": _safe_float_val(series.mean()),
            "std": _safe_float_val(series.std()),
            "missing": int(series.isna().sum()),
        }
    return stats


def _class_dist(y: np.ndarray) -> Dict[str, int]:
    """Return class distribution as ``{label_str: count}``."""
    unique, counts = np.unique(y, return_counts=True)
    return {str(u): int(c) for u, c in zip(unique, counts)}


def _safe_float_val(value: Any) -> float:
    """Convert to float, replacing NaN/Inf with 0.0."""
    if value is None:
        return 0.0
    try:
        f = float(value)
        if math.isnan(f) or math.isinf(f):
            return 0.0
        return round(f, 6)
    except (TypeError, ValueError):
        return 0.0
