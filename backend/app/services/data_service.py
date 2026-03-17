"""Business logic for Step 2 — Data Exploration.

Handles CSV upload validation, built-in dataset loading, data summary
computation, column-type detection, column-mapping validation, and
data preview generation.
"""

from __future__ import annotations

import io
import math
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from fastapi import HTTPException, UploadFile, status

from app.models.common import WarningItem
from app.models.data import (
    ClassInfo,
    ColumnInfo,
    ColumnMapping,
)
from app.services import domain_service
from app.utils.constants import (
    ALLOWED_EXTENSIONS,
    CATEGORICAL_MAX_UNIQUE,
    HIGH_CARDINALITY_THRESHOLD,
    IMBALANCE_THRESHOLD,
    MAX_FILE_SIZE_BYTES,
    MAX_FILE_SIZE_MB,
    MIN_NUMERIC_COLUMNS,
    MIN_ROWS,
    MISSING_AMBER_THRESHOLD,
    MISSING_GREEN_THRESHOLD,
    QUALITY_BALANCE_WEIGHT,
    QUALITY_CARDINALITY_WEIGHT,
    QUALITY_COMPLETENESS_WEIGHT,
    QUALITY_CONSTANT_COLS_WEIGHT,
    QUALITY_DUPLICATES_WEIGHT,
)

# Path to the built-in dataset directory
BUILTIN_DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"


# ---------------------------------------------------------------------------
# CSV Upload & Validation
# ---------------------------------------------------------------------------

async def validate_and_load_csv(
    file: UploadFile,
) -> Tuple[pd.DataFrame, dict]:
    """Validate an uploaded CSV file and return the parsed DataFrame.

    Checks:
      - File extension is ``.csv``
      - File size does not exceed the configured limit
      - Content is parseable as CSV
      - DataFrame has at least ``MIN_ROWS`` rows
      - DataFrame has at least ``MIN_NUMERIC_COLUMNS`` numeric column

    Returns:
        A tuple of ``(DataFrame, metadata_dict)`` where metadata contains
        ``filename`` and ``file_size_kb``.

    Raises:
        ``HTTPException`` with a friendly message on any validation failure.
    """
    # --- extension check ---
    filename = file.filename or "upload.csv"
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file type '{suffix}'. "
                f"Only CSV files are accepted."
            ),
        )

    # --- read bytes & size check ---
    contents = await file.read()
    file_size = len(contents)
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                f"File size ({file_size / (1024 * 1024):.1f} MB) exceeds "
                f"the {MAX_FILE_SIZE_MB} MB limit."
            ),
        )

    # --- parse CSV ---
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not parse CSV file: {exc}",
        )

    # --- row count check ---
    if len(df) < MIN_ROWS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Dataset must contain at least {MIN_ROWS} rows, "
                f"but this file has only {len(df)}."
            ),
        )

    # --- numeric column check ---
    numeric_count = sum(
        1 for col in df.columns if pd.api.types.is_numeric_dtype(df[col])
    )
    if numeric_count < MIN_NUMERIC_COLUMNS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Dataset must contain at least {MIN_NUMERIC_COLUMNS} numeric "
                f"column(s), but none were found."
            ),
        )

    metadata = {
        "filename": filename,
        "file_size_kb": round(file_size / 1024, 2),
    }
    return df, metadata


# ---------------------------------------------------------------------------
# Built-in Dataset Loading
# ---------------------------------------------------------------------------

def load_builtin_dataset(domain_id: str) -> pd.DataFrame:
    """Load a built-in CSV dataset for the given clinical domain.

    Raises:
        ``HTTPException`` if the domain is unknown or the file is missing.
    """
    dataset_name = domain_service.get_dataset_filename(domain_id)
    if dataset_name is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown domain '{domain_id}'.",
        )

    csv_path = BUILTIN_DATA_DIR / f"{dataset_name}.csv"
    if not csv_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Built-in dataset file '{dataset_name}.csv' not found. "
                f"Expected at {csv_path}."
            ),
        )

    df = pd.read_csv(csv_path)
    return df


# ---------------------------------------------------------------------------
# Data Summary Computation
# ---------------------------------------------------------------------------

def compute_summary(df: pd.DataFrame, target_column: str) -> dict:
    """Compute a comprehensive data summary dictionary.

    The returned dict is ready to be unpacked into a ``DataSummary``
    Pydantic model (minus ``session_id`` which the caller adds).
    """
    warnings: List[WarningItem] = []
    total_rows = len(df)
    total_cols = len(df.columns)
    total_cells = total_rows * total_cols
    total_missing = int(df.isna().sum().sum())
    total_missing_pct = round((total_missing / total_cells) * 100, 2) if total_cells > 0 else 0.0

    # --- per-column info ---
    column_types = detect_column_types(df)
    columns: List[ColumnInfo] = []
    for col in df.columns:
        series = df[col]
        missing_count = int(series.isna().sum())
        missing_pct = round((missing_count / total_rows) * 100, 2) if total_rows > 0 else 0.0
        unique_count = int(series.nunique(dropna=True))

        # action tag thresholds
        if missing_pct / 100.0 < MISSING_GREEN_THRESHOLD:
            action_tag = "OK"
            action_color = "green"
        elif missing_pct / 100.0 < MISSING_AMBER_THRESHOLD:
            action_tag = "Some Missing"
            action_color = "amber"
        else:
            action_tag = "High Missing"
            action_color = "red"

        # sample values (up to 5 non-null)
        non_null = series.dropna()
        sample_values = [_json_safe(v) for v in non_null.head(5).tolist()]

        # min/max for numeric
        min_val = None
        max_val = None
        if pd.api.types.is_numeric_dtype(series):
            min_val = _safe_float(series.min())
            max_val = _safe_float(series.max())

        columns.append(
            ColumnInfo(
                name=col,
                dtype=column_types.get(col, "categorical"),
                missing_count=missing_count,
                missing_pct=missing_pct,
                unique_count=unique_count,
                action_tag=action_tag,
                action_color=action_color,
                sample_values=sample_values,
                min_val=min_val,
                max_val=max_val,
            )
        )

    # --- class distribution ---
    class_distribution: List[ClassInfo] = []
    is_imbalanced = False
    imbalance_warning: Optional[str] = None

    if target_column in df.columns:
        vc = df[target_column].value_counts(dropna=True)
        total_target = int(vc.sum())
        for label, count in vc.items():
            pct = round((int(count) / total_target) * 100, 2) if total_target > 0 else 0.0
            class_distribution.append(
                ClassInfo(class_name=str(label), count=int(count), percentage=pct)
            )
        if len(class_distribution) >= 2:
            minority_pct = min(ci.percentage for ci in class_distribution) / 100.0
            if minority_pct < IMBALANCE_THRESHOLD:
                is_imbalanced = True
                imbalance_warning = (
                    f"Class imbalance detected: the minority class represents "
                    f"only {minority_pct:.0%} of the data. Consider enabling "
                    f"SMOTE in the Data Preparation step."
                )
                warnings.append(
                    WarningItem(level="warning", message=imbalance_warning)
                )

    # --- smart warnings ---
    duplicate_rows = int(df.duplicated().sum())
    if duplicate_rows > 0:
        warnings.append(
            WarningItem(
                level="warning",
                message=f"Dataset contains {duplicate_rows} duplicate rows.",
            )
        )

    for ci in columns:
        # identifier columns
        if ci.dtype == "identifier":
            warnings.append(
                WarningItem(
                    level="info",
                    message=(
                        f"Column '{ci.name}' looks like an identifier "
                        f"(all unique values). Consider excluding it from features."
                    ),
                    column=ci.name,
                )
            )

        # constant columns
        if ci.unique_count <= 1:
            warnings.append(
                WarningItem(
                    level="warning",
                    message=(
                        f"Column '{ci.name}' has only {ci.unique_count} unique "
                        f"value(s) and carries no predictive information."
                    ),
                    column=ci.name,
                )
            )

        # high cardinality categorical
        if (
            ci.dtype == "categorical"
            and ci.unique_count > HIGH_CARDINALITY_THRESHOLD
        ):
            warnings.append(
                WarningItem(
                    level="warning",
                    message=(
                        f"Column '{ci.name}' has high cardinality "
                        f"({ci.unique_count} unique values). One-hot encoding "
                        f"may create too many features."
                    ),
                    column=ci.name,
                )
            )

        # high missing
        if ci.action_tag == "High Missing":
            warnings.append(
                WarningItem(
                    level="error",
                    message=(
                        f"Column '{ci.name}' has {ci.missing_pct:.1f}% missing "
                        f"values. Consider removing it or using careful imputation."
                    ),
                    column=ci.name,
                )
            )

    # --- data quality score ---
    data_quality_score = _compute_quality_score(
        df, columns, duplicate_rows, class_distribution
    )

    return {
        "row_count": total_rows,
        "column_count": total_cols,
        "total_missing_pct": total_missing_pct,
        "columns": columns,
        "class_distribution": class_distribution,
        "target_column": target_column,
        "is_imbalanced": is_imbalanced,
        "imbalance_warning": imbalance_warning,
        "data_quality_score": data_quality_score,
        "warnings": warnings,
    }


# ---------------------------------------------------------------------------
# Column Type Detection
# ---------------------------------------------------------------------------

def detect_column_types(df: pd.DataFrame) -> Dict[str, str]:
    """Auto-detect column types as one of:
    ``numeric``, ``categorical``, ``binary``, ``identifier``, ``datetime``.
    """
    result: Dict[str, str] = {}
    for col in df.columns:
        series = df[col]
        nunique = series.nunique(dropna=True)
        total = len(series.dropna())

        is_string_like = (
            pd.api.types.is_string_dtype(series)
            or pd.api.types.is_object_dtype(series)
        )

        # datetime detection (try parsing)
        if is_string_like:
            sample = series.dropna().head(20)
            try:
                pd.to_datetime(sample, format="mixed")
                result[col] = "datetime"
                continue
            except (ValueError, TypeError):
                pass

        # numeric types
        if pd.api.types.is_numeric_dtype(series):
            if nunique == 2:
                result[col] = "binary"
            else:
                result[col] = "numeric"
            continue

        # string / object / categorical types
        if nunique == total and total > 10:
            # every value is unique and there are more than 10 rows -> identifier
            result[col] = "identifier"
        elif nunique == 2:
            result[col] = "binary"
        elif nunique <= CATEGORICAL_MAX_UNIQUE:
            result[col] = "categorical"
        else:
            result[col] = "categorical"

    return result


# ---------------------------------------------------------------------------
# Column Mapping Validation
# ---------------------------------------------------------------------------

def validate_column_mapping(
    df: pd.DataFrame,
    target_column: str,
    mappings: List[ColumnMapping],
) -> dict:
    """Validate the user-provided column mapping.

    Returns a dict with keys ``schema_ok``, ``warnings``,
    ``feature_count``, ``ignored_count``.
    """
    warnings: List[WarningItem] = []
    all_cols = set(df.columns)

    # Check target exists
    if target_column not in all_cols:
        warnings.append(
            WarningItem(
                level="error",
                message=f"Target column '{target_column}' not found in the dataset.",
            )
        )
        return {
            "schema_ok": False,
            "warnings": warnings,
            "feature_count": 0,
            "ignored_count": 0,
        }

    # Categorise mappings
    feature_columns: List[str] = []
    ignored_columns: List[str] = []
    for m in mappings:
        if m.csv_column not in all_cols:
            warnings.append(
                WarningItem(
                    level="error",
                    message=f"Column '{m.csv_column}' from mapping not found in dataset.",
                    column=m.csv_column,
                )
            )
            continue
        if m.role == "feature":
            feature_columns.append(m.csv_column)
        elif m.role == "ignore":
            ignored_columns.append(m.csv_column)
        # "target" role is handled separately via target_column param

    # Validate target is categorical-ish
    target_series = df[target_column]
    target_unique = target_series.nunique(dropna=True)
    if target_unique > 20:
        warnings.append(
            WarningItem(
                level="warning",
                message=(
                    f"Target column '{target_column}' has {target_unique} unique "
                    f"values. This seems more like a continuous variable than a "
                    f"classification target."
                ),
            )
        )
    if target_unique < 2:
        warnings.append(
            WarningItem(
                level="error",
                message=(
                    f"Target column '{target_column}' has fewer than 2 unique "
                    f"values. Classification requires at least 2 classes."
                ),
            )
        )

    # Must have at least one feature
    if len(feature_columns) == 0:
        warnings.append(
            WarningItem(
                level="error",
                message="At least one feature column must be selected.",
            )
        )

    # Target should not be in features
    if target_column in feature_columns:
        warnings.append(
            WarningItem(
                level="error",
                message="The target column must not also be a feature column.",
            )
        )

    schema_ok = not any(w.level == "error" for w in warnings)

    return {
        "schema_ok": schema_ok,
        "warnings": warnings,
        "feature_count": len(feature_columns),
        "ignored_count": len(ignored_columns),
    }


# ---------------------------------------------------------------------------
# Data Preview
# ---------------------------------------------------------------------------

def get_preview(df: pd.DataFrame, rows: int = 5) -> dict:
    """Return the first *rows* of the DataFrame as JSON-safe dicts.

    NaN values are converted to ``None``.

    Returns a dict with ``columns``, ``rows``, and ``total_rows``.
    """
    preview = df.head(rows)
    columns = list(preview.columns)

    # Convert NaN -> None and ensure all values are JSON-serialisable
    records: List[Dict[str, Any]] = []
    for _, row in preview.iterrows():
        record: Dict[str, Any] = {}
        for col in columns:
            val = row[col]
            record[col] = _json_safe(val)
        records.append(record)

    return {
        "columns": columns,
        "rows": records,
        "total_rows": len(df),
    }


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _safe_float(value: Any) -> Optional[float]:
    """Convert a value to float, returning None for NaN/None/Inf."""
    if value is None:
        return None
    try:
        f = float(value)
        if math.isnan(f) or math.isinf(f):
            return None
        return round(f, 4)
    except (TypeError, ValueError):
        return None


def _json_safe(value: Any) -> Any:
    """Make a single value safe for JSON serialisation."""
    if value is None:
        return None
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
        return value
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        f = float(value)
        if math.isnan(f) or math.isinf(f):
            return None
        return f
    if isinstance(value, np.bool_):
        return bool(value)
    if isinstance(value, (np.ndarray,)):
        return value.tolist()
    if pd.isna(value):
        return None
    return value


def _compute_quality_score(
    df: pd.DataFrame,
    columns: List[ColumnInfo],
    duplicate_rows: int,
    class_distribution: List[ClassInfo],
) -> int:
    """Compute an overall data quality score (0-100).

    Weighted components:
      - Completeness (40): proportion of non-null cells
      - No duplicates (20): proportion of unique rows
      - No constant columns (15): proportion of informative columns
      - No high cardinality (15): proportion of columns without excessive cardinality
      - Class balance (10): how balanced the target classes are
    """
    total_rows = len(df)
    total_cols = len(df.columns)
    total_cells = total_rows * total_cols

    # Completeness
    total_missing = sum(ci.missing_count for ci in columns)
    completeness = 1.0 - (total_missing / total_cells) if total_cells > 0 else 1.0

    # Duplicates
    dup_ratio = 1.0 - (duplicate_rows / total_rows) if total_rows > 0 else 1.0

    # Constant columns
    constant_cols = sum(1 for ci in columns if ci.unique_count <= 1)
    const_ratio = (
        1.0 - (constant_cols / len(columns)) if columns else 1.0
    )

    # High cardinality
    high_card = sum(
        1
        for ci in columns
        if ci.dtype == "categorical" and ci.unique_count > HIGH_CARDINALITY_THRESHOLD
    )
    card_ratio = 1.0 - (high_card / len(columns)) if columns else 1.0

    # Class balance
    balance_ratio = 1.0
    if len(class_distribution) >= 2:
        pcts = [ci.percentage / 100.0 for ci in class_distribution]
        ideal = 1.0 / len(pcts)
        deviation = sum(abs(p - ideal) for p in pcts) / len(pcts)
        balance_ratio = max(0.0, 1.0 - deviation * 2)

    score = (
        completeness * QUALITY_COMPLETENESS_WEIGHT
        + dup_ratio * QUALITY_DUPLICATES_WEIGHT
        + const_ratio * QUALITY_CONSTANT_COLS_WEIGHT
        + card_ratio * QUALITY_CARDINALITY_WEIGHT
        + balance_ratio * QUALITY_BALANCE_WEIGHT
    )

    return max(0, min(100, round(score)))
