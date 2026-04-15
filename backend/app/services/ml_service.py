"""Business logic for Steps 4-5 — Model Training & Results.

Provides the full ML training pipeline: model instantiation from a
registry of 8 classifiers, hyperparameter application, metric computation,
confusion matrix / ROC / PR curve generation, cross-validation, and
overfitting detection.
"""

from __future__ import annotations

import logging
import math
import time
import uuid

logger = logging.getLogger("medvix.ml")
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    auc,
    confusion_matrix,
    f1_score,
    matthews_corrcoef,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder, label_binarize
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

from app.models.ml import (
    ComparisonResponse,
    ConfusionMatrixData,
    CrossValidationData,
    HyperparamDef,
    HyperparamsResponse,
    MetricValue,
    PRCurveData,
    ROCCurveData,
    TrainedModelSummary,
    TrainResponse,
)
from app.models.session import SessionState

# ---------------------------------------------------------------------------
# Lazy imports for optional heavy libraries
# ---------------------------------------------------------------------------


def _get_xgb_class():
    """Lazily import XGBClassifier to avoid startup cost if unused."""
    from xgboost import XGBClassifier

    return XGBClassifier


def _get_lgbm_class():
    """Lazily import LGBMClassifier to avoid startup cost if unused."""
    from lightgbm import LGBMClassifier

    return LGBMClassifier


# ---------------------------------------------------------------------------
# Model registry — 8 classifiers with full hyperparam definitions
# ---------------------------------------------------------------------------

MODEL_REGISTRY: Dict[str, Dict[str, Any]] = {
    "knn": {
        "class": KNeighborsClassifier,
        "name": "K-Nearest Neighbours",
        "description": (
            "Classifies samples by majority vote of their k closest "
            "neighbours in feature space."
        ),
        "difficulty": "beginner",
        "default_kwargs": {},
        "params": [
            HyperparamDef(
                name="n_neighbors",
                label="Number of Neighbours (k)",
                type="int",
                min=1,
                max=25,
                step=1,
                default=5,
                description="Number of nearest neighbours to consider for voting.",
            ),
            HyperparamDef(
                name="metric",
                label="Distance Metric",
                type="select",
                default="euclidean",
                options=["euclidean", "manhattan", "minkowski"],
                description="The distance function used to find neighbours.",
            ),
            HyperparamDef(
                name="weights",
                label="Weight Function",
                type="select",
                default="uniform",
                options=["uniform", "distance"],
                description=(
                    "Whether closer neighbours have more influence (distance) "
                    "or all neighbours count equally (uniform)."
                ),
            ),
        ],
    },
    "svm": {
        "class": SVC,
        "name": "Support Vector Machine",
        "description": (
            "Finds the optimal hyperplane that maximally separates classes "
            "in high-dimensional space."
        ),
        "difficulty": "intermediate",
        "default_kwargs": {"probability": True},
        "params": [
            HyperparamDef(
                name="kernel",
                label="Kernel Function",
                type="select",
                default="rbf",
                options=["linear", "rbf", "poly"],
                description=(
                    "The kernel trick used to project data into higher dimensions."
                ),
            ),
            HyperparamDef(
                name="C",
                label="Regularisation (C)",
                type="float",
                min=0.01,
                max=100.0,
                step=0.1,
                default=1.0,
                description=(
                    "Penalty parameter — higher values reduce misclassification "
                    "but risk overfitting."
                ),
            ),
            HyperparamDef(
                name="gamma",
                label="Gamma",
                type="select",
                default="scale",
                options=["scale", "auto"],
                description=(
                    "Kernel coefficient — 'scale' uses 1/(n_features*var), "
                    "'auto' uses 1/n_features."
                ),
            ),
        ],
    },
    "decision_tree": {
        "class": DecisionTreeClassifier,
        "name": "Decision Tree",
        "description": (
            "Builds a tree of if/else rules by recursively splitting on "
            "the most informative features."
        ),
        "difficulty": "beginner",
        "default_kwargs": {},
        "params": [
            HyperparamDef(
                name="max_depth",
                label="Maximum Tree Depth",
                type="int",
                min=1,
                max=30,
                step=1,
                default=10,
                description="Maximum depth of the tree — limits complexity.",
            ),
            HyperparamDef(
                name="criterion",
                label="Split Criterion",
                type="select",
                default="gini",
                options=["gini", "entropy"],
                description="Function to measure the quality of a split.",
            ),
            HyperparamDef(
                name="min_samples_split",
                label="Min Samples to Split",
                type="int",
                min=2,
                max=20,
                step=1,
                default=2,
                description=(
                    "Minimum number of samples required to split an internal node."
                ),
            ),
        ],
    },
    "random_forest": {
        "class": RandomForestClassifier,
        "name": "Random Forest",
        "description": (
            "Ensemble of decision trees trained on random subsets of data, "
            "reducing overfitting through averaging."
        ),
        "difficulty": "intermediate",
        "default_kwargs": {},
        "params": [
            HyperparamDef(
                name="n_estimators",
                label="Number of Trees",
                type="int",
                min=10,
                max=500,
                step=10,
                default=100,
                description="How many decision trees to grow in the forest.",
            ),
            HyperparamDef(
                name="max_depth",
                label="Maximum Tree Depth",
                type="int",
                min=1,
                max=30,
                step=1,
                default=10,
                description="Maximum depth of each tree.",
            ),
            HyperparamDef(
                name="criterion",
                label="Split Criterion",
                type="select",
                default="gini",
                options=["gini", "entropy"],
                description="Function to measure the quality of a split.",
            ),
        ],
    },
    "logistic_regression": {
        "class": LogisticRegression,
        "name": "Logistic Regression",
        "description": (
            "Linear model that estimates class probabilities using a "
            "logistic (sigmoid) function."
        ),
        "difficulty": "beginner",
        "default_kwargs": {"max_iter": 1000},
        "params": [
            HyperparamDef(
                name="C",
                label="Inverse Regularisation (C)",
                type="float",
                min=0.01,
                max=100.0,
                step=0.1,
                default=1.0,
                description=(
                    "Inverse regularisation strength — smaller values mean "
                    "stronger regularisation."
                ),
            ),
            HyperparamDef(
                name="solver",
                label="Solver Algorithm",
                type="select",
                default="lbfgs",
                options=["lbfgs", "liblinear", "saga"],
                description="Optimisation algorithm used internally.",
            ),
        ],
    },
    "naive_bayes": {
        "class": GaussianNB,
        "name": "Gaussian Naive Bayes",
        "description": (
            "Probabilistic classifier assuming feature independence — "
            "uses minimal tuning, adjust smoothing if needed."
        ),
        "difficulty": "beginner",
        "default_kwargs": {},
        "params": [
            HyperparamDef(
                name="var_smoothing",
                label="Variance Smoothing",
                type="float",
                min=1e-12,
                max=1e-6,
                step=0.0,  # log-scale — frontend should use log slider
                default=1e-9,
                description=(
                    "Additive portion of the largest variance for numerical "
                    "stability (log scale recommended)."
                ),
            ),
        ],
    },
    "xgboost": {
        "class_lazy": _get_xgb_class,
        "name": "XGBoost",
        "description": (
            "Gradient-boosted decision trees optimised for speed and "
            "performance — a top choice in competitions and production."
        ),
        "difficulty": "advanced",
        "default_kwargs": {"eval_metric": "logloss", "use_label_encoder": False},
        "params": [
            HyperparamDef(
                name="n_estimators",
                label="Number of Boosting Rounds",
                type="int",
                min=10,
                max=500,
                step=10,
                default=100,
                description="Number of gradient-boosting iterations.",
            ),
            HyperparamDef(
                name="max_depth",
                label="Maximum Tree Depth",
                type="int",
                min=3,
                max=15,
                step=1,
                default=6,
                description="Maximum depth of each boosted tree.",
            ),
            HyperparamDef(
                name="learning_rate",
                label="Learning Rate",
                type="float",
                min=0.01,
                max=1.0,
                step=0.01,
                default=0.1,
                description=(
                    "Step-size shrinkage — smaller values need more rounds "
                    "but generalise better."
                ),
            ),
        ],
    },
    "lightgbm": {
        "class_lazy": _get_lgbm_class,
        "name": "LightGBM",
        "description": (
            "Fast gradient-boosting framework using histogram-based "
            "learning — efficient on large datasets."
        ),
        "difficulty": "advanced",
        "default_kwargs": {"verbose": -1},
        "params": [
            HyperparamDef(
                name="n_estimators",
                label="Number of Boosting Rounds",
                type="int",
                min=10,
                max=500,
                step=10,
                default=100,
                description="Number of gradient-boosting iterations.",
            ),
            HyperparamDef(
                name="max_depth",
                label="Maximum Tree Depth",
                type="int",
                min=3,
                max=15,
                step=1,
                default=6,
                description="Maximum depth of each boosted tree.",
            ),
            HyperparamDef(
                name="learning_rate",
                label="Learning Rate",
                type="float",
                min=0.01,
                max=1.0,
                step=0.01,
                default=0.1,
                description=(
                    "Step-size shrinkage — smaller values need more rounds "
                    "but generalise better."
                ),
            ),
        ],
    },
}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def get_hyperparam_definitions(model_type: str) -> HyperparamsResponse:
    """Return the tunable hyperparameter definitions for *model_type*.

    Raises ``ValueError`` if the model_type is not in the registry.
    """
    entry = MODEL_REGISTRY.get(model_type)
    if entry is None:
        valid = ", ".join(sorted(MODEL_REGISTRY.keys()))
        raise ValueError(
            f"Unknown model_type '{model_type}'. Valid types: {valid}"
        )

    return HyperparamsResponse(
        model_type=model_type,
        model_name=entry["name"],
        description=entry["description"],
        difficulty=entry["difficulty"],
        params=entry["params"],
    )


def train_model(
    session: SessionState,
    model_type: str,
    hyperparams: Dict[str, Any],
) -> TrainResponse:
    """Train a single model on the session's prepared data and return full results.

    Raises ``ValueError`` for invalid model types or unprepared sessions.
    """
    # --- Validate session readiness ---
    if not session.is_prepared:
        raise ValueError(
            "Data has not been prepared. Complete Step 3 before training."
        )
    if session.X_train is None or session.y_train is None:
        raise ValueError("Training data is missing from the session.")

    entry = MODEL_REGISTRY.get(model_type)
    if entry is None:
        valid = ", ".join(sorted(MODEL_REGISTRY.keys()))
        raise ValueError(
            f"Unknown model_type '{model_type}'. Valid types: {valid}"
        )

    X_train = session.X_train
    X_test = session.X_test
    y_train = session.y_train
    y_test = session.y_test

    # --- Resolve model class (lazy imports for xgboost / lightgbm) ---
    if "class" in entry:
        model_cls = entry["class"]
    else:
        try:
            model_cls = entry["class_lazy"]()
        except (ImportError, OSError) as exc:
            raise ValueError(
                f"The {entry['name']} library is not available on this system. "
                f"This typically requires the OpenMP runtime (libomp). "
                f"On macOS run: brew install libomp"
            ) from exc

    # --- Build merged hyperparams (user-supplied overrides + defaults) ---
    merged_params = dict(entry.get("default_kwargs", {}))
    param_defs = {p.name: p for p in entry["params"]}

    for pdef in entry["params"]:
        if pdef.name in hyperparams:
            merged_params[pdef.name] = _cast_param(
                pdef, hyperparams[pdef.name]
            )
        else:
            merged_params[pdef.name] = _cast_param(pdef, pdef.default)

    # --- XGBoost requires numeric labels ---
    le_xgb: Optional[LabelEncoder] = None
    if model_type == "xgboost":
        unique_labels = np.unique(y_train)
        if not np.issubdtype(unique_labels.dtype, np.integer):
            le_xgb = LabelEncoder()
            y_train = le_xgb.fit_transform(y_train)
            y_test = le_xgb.transform(y_test)

    # --- Instantiate and train ---
    model = model_cls(**merged_params)

    start_ns = time.perf_counter_ns()
    model.fit(X_train, y_train)
    elapsed_ms = int((time.perf_counter_ns() - start_ns) / 1_000_000)

    # --- Predictions ---
    y_pred = model.predict(X_test)
    y_pred_train = model.predict(X_train)

    y_pred_proba: Optional[np.ndarray] = None
    if hasattr(model, "predict_proba"):
        try:
            y_pred_proba = model.predict_proba(X_test)
        except Exception:
            y_pred_proba = None

    # --- Determine class count ---
    classes = np.unique(np.concatenate([y_train, y_test]))
    n_classes = len(classes)
    is_binary = n_classes == 2
    class_labels = [str(c) for c in classes]

    # --- Compute metrics ---
    test_accuracy = float(accuracy_score(y_test, y_pred))
    train_accuracy = float(accuracy_score(y_train, y_pred_train))

    metrics_list: List[MetricValue] = []

    metrics_list.append(
        MetricValue(
            name="accuracy",
            value=_round6(test_accuracy),
            label="Accuracy",
            description="Proportion of correct predictions over all samples.",
            status=_metric_status(test_accuracy),
        )
    )

    if is_binary:
        sensitivity = float(recall_score(y_test, y_pred, pos_label=classes[1]))
        specificity = float(recall_score(y_test, y_pred, pos_label=classes[0]))
        precision_val = float(
            precision_score(y_test, y_pred, pos_label=classes[1], zero_division=0)
        )
        f1_val = float(f1_score(y_test, y_pred, pos_label=classes[1], zero_division=0))

        metrics_list.append(
            MetricValue(
                name="sensitivity",
                value=_round6(sensitivity),
                label="Sensitivity (Recall)",
                description=(
                    "True positive rate — proportion of actual positives "
                    "correctly identified. Critical in healthcare."
                ),
                status=_metric_status(sensitivity),
                is_priority=True,
            )
        )
        metrics_list.append(
            MetricValue(
                name="specificity",
                value=_round6(specificity),
                label="Specificity",
                description=(
                    "True negative rate — proportion of actual negatives "
                    "correctly identified."
                ),
                status=_metric_status(specificity),
            )
        )
        metrics_list.append(
            MetricValue(
                name="precision",
                value=_round6(precision_val),
                label="Precision",
                description=(
                    "Positive predictive value — proportion of positive "
                    "predictions that are correct."
                ),
                status=_metric_status(precision_val),
            )
        )
        metrics_list.append(
            MetricValue(
                name="f1",
                value=_round6(f1_val),
                label="F1 Score",
                description="Harmonic mean of precision and sensitivity.",
                status=_metric_status(f1_val),
            )
        )

        # AUC-ROC (binary)
        if y_pred_proba is not None:
            try:
                auc_roc_val = float(
                    roc_auc_score(y_test, y_pred_proba[:, 1])
                )
                metrics_list.append(
                    MetricValue(
                        name="auc_roc",
                        value=_round6(auc_roc_val),
                        label="AUC-ROC",
                        description=(
                            "Area under the ROC curve — measures the model's "
                            "ability to distinguish between classes."
                        ),
                        status=_metric_status(auc_roc_val),
                    )
                )
            except Exception:
                pass

    else:
        # Multiclass metrics — weighted averages
        sensitivity = float(
            recall_score(y_test, y_pred, average="weighted", zero_division=0)
        )
        precision_val = float(
            precision_score(y_test, y_pred, average="weighted", zero_division=0)
        )
        f1_val = float(
            f1_score(y_test, y_pred, average="weighted", zero_division=0)
        )

        metrics_list.append(
            MetricValue(
                name="sensitivity",
                value=_round6(sensitivity),
                label="Sensitivity (Weighted)",
                description=(
                    "Weighted average recall across all classes. "
                    "Critical in healthcare."
                ),
                status=_metric_status(sensitivity),
                is_priority=True,
            )
        )
        metrics_list.append(
            MetricValue(
                name="precision",
                value=_round6(precision_val),
                label="Precision (Weighted)",
                description="Weighted average precision across all classes.",
                status=_metric_status(precision_val),
            )
        )
        metrics_list.append(
            MetricValue(
                name="f1",
                value=_round6(f1_val),
                label="F1 Score (Weighted)",
                description=(
                    "Weighted average F1 score across all classes."
                ),
                status=_metric_status(f1_val),
            )
        )

        # AUC-ROC (multiclass OvR)
        if y_pred_proba is not None:
            try:
                auc_roc_val = float(
                    roc_auc_score(
                        y_test,
                        y_pred_proba,
                        multi_class="ovr",
                        average="weighted",
                    )
                )
                metrics_list.append(
                    MetricValue(
                        name="auc_roc",
                        value=_round6(auc_roc_val),
                        label="AUC-ROC (Weighted OvR)",
                        description=(
                            "Weighted one-vs-rest AUC across all classes."
                        ),
                        status=_metric_status(auc_roc_val),
                    )
                )
            except Exception:
                pass

    # MCC — works for both binary and multiclass
    mcc = float(matthews_corrcoef(y_test, y_pred))
    metrics_list.append(
        MetricValue(
            name="mcc",
            value=_round6(mcc),
            label="Matthews Correlation Coefficient",
            description=(
                "Balanced measure accounting for all confusion matrix quadrants. "
                "Ranges from -1 (worst) to +1 (perfect)."
            ),
            status=_metric_status((mcc + 1) / 2),  # map [-1,1] → [0,1] for status
        )
    )

    # --- Confusion matrix ---
    cm = confusion_matrix(y_test, y_pred, labels=classes)
    cm_data = ConfusionMatrixData(
        matrix=cm.tolist(),
        labels=class_labels,
    )

    # --- ROC curve ---
    roc_data: Optional[ROCCurveData] = None
    if is_binary and y_pred_proba is not None:
        try:
            fpr_arr, tpr_arr, _ = roc_curve(y_test, y_pred_proba[:, 1])
            roc_data = ROCCurveData(
                fpr=_to_float_list(fpr_arr),
                tpr=_to_float_list(tpr_arr),
                auc=_round6(float(auc(fpr_arr, tpr_arr))),
            )
        except Exception:
            pass

    # --- PR curve ---
    pr_data: Optional[PRCurveData] = None
    if is_binary and y_pred_proba is not None:
        try:
            prec_arr, rec_arr, _ = precision_recall_curve(
                y_test, y_pred_proba[:, 1]
            )
            pr_auc = float(auc(rec_arr, prec_arr))
            pr_data = PRCurveData(
                precision_values=_to_float_list(prec_arr),
                recall_values=_to_float_list(rec_arr),
                auc=_round6(pr_auc),
            )
        except Exception:
            pass

    # --- Cross-validation (stratified k-fold) ---
    n_samples = len(X_train)
    if n_samples < 50:
        n_folds = max(2, min(5, n_samples // 5))
    else:
        n_folds = 5

    # Need a fresh model for CV (avoid leakage from fitted state)
    cv_model = model_cls(**merged_params)
    try:
        cv = StratifiedKFold(n_splits=n_folds, shuffle=True, random_state=42)
        fold_scores = cross_val_score(
            cv_model, X_train, y_train, cv=cv, scoring="accuracy"
        )
        cv_data = CrossValidationData(
            fold_scores=_to_float_list(fold_scores),
            mean=_round6(float(fold_scores.mean())),
            std=_round6(float(fold_scores.std())),
            n_folds=n_folds,
        )
    except Exception:
        # Fallback: if stratified CV fails (very small classes)
        cv_data = CrossValidationData(
            fold_scores=[_round6(test_accuracy)],
            mean=_round6(test_accuracy),
            std=0.0,
            n_folds=1,
        )

    # --- Overfitting detection ---
    overfit_warning: Optional[str] = None
    gap = train_accuracy - test_accuracy
    if gap > 0.10:
        overfit_warning = (
            f"Possible overfitting detected: training accuracy "
            f"({train_accuracy:.1%}) is {gap:.1%} higher than test accuracy "
            f"({test_accuracy:.1%}). Consider reducing model complexity, "
            f"increasing regularisation, or collecting more data."
        )

    # --- Store user-facing hyperparams (without internal defaults) ---
    user_facing_params: Dict[str, Any] = {}
    for pdef in entry["params"]:
        if pdef.name in hyperparams:
            user_facing_params[pdef.name] = hyperparams[pdef.name]
        else:
            user_facing_params[pdef.name] = pdef.default

    # --- Generate model ID and store on session ---
    model_id = uuid.uuid4().hex[:12]

    response = TrainResponse(
        model_id=model_id,
        model_type=model_type,
        model_name=entry["name"],
        metrics=metrics_list,
        confusion_matrix=cm_data,
        roc_curve=roc_data,
        pr_curve=pr_data,
        cross_validation=cv_data,
        training_time_ms=elapsed_ms,
        hyperparams=user_facing_params,
        train_accuracy=_round6(train_accuracy),
        test_accuracy=_round6(test_accuracy),
        overfit_warning=overfit_warning,
    )

    # Store on session for comparison later
    if not hasattr(session, "trained_models") or session.trained_models is None:
        session.trained_models = {}
    session.trained_models[model_id] = response.model_dump()

    # Store fitted model object for SHAP explainability (Step 6)
    if not hasattr(session, "model_objects") or session.model_objects is None:
        session.model_objects = {}
    session.model_objects[model_id] = model
    logger.info("Stored model object %s (%s), total objects: %d", model_id, model_type, len(session.model_objects))

    return response


def get_trained_models(session: SessionState) -> List[TrainedModelSummary]:
    """Return lightweight summaries for all models trained in this session."""
    if not hasattr(session, "trained_models") or not session.trained_models:
        return []

    summaries: List[TrainedModelSummary] = []
    for model_id, data in session.trained_models.items():
        summaries.append(
            TrainedModelSummary(
                model_id=data["model_id"],
                model_type=data["model_type"],
                model_name=data["model_name"],
                metrics=[MetricValue(**m) for m in data["metrics"]],
                training_time_ms=data["training_time_ms"],
                hyperparams=data["hyperparams"],
            )
        )
    return summaries


def compare_models(session: SessionState) -> ComparisonResponse:
    """Compare all trained models and identify the best per-metric.

    Raises ``ValueError`` if fewer than 1 model has been trained.
    """
    summaries = get_trained_models(session)
    if not summaries:
        raise ValueError("No models have been trained in this session yet.")

    # Find best model per metric
    best_by_metric: Dict[str, str] = {}
    metric_names: set[str] = set()
    for s in summaries:
        for m in s.metrics:
            metric_names.add(m.name)

    for mname in metric_names:
        best_id: Optional[str] = None
        best_val = -float("inf")
        for s in summaries:
            for m in s.metrics:
                if m.name == mname and m.value > best_val:
                    best_val = m.value
                    best_id = s.model_id
        if best_id is not None:
            best_by_metric[mname] = best_id

    # Overall best = best by F1, then accuracy as fallback
    best_model_id: Optional[str] = best_by_metric.get(
        "f1", best_by_metric.get("accuracy")
    )

    return ComparisonResponse(
        models=summaries,
        best_model_id=best_model_id,
        best_by_metric=best_by_metric,
    )


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------


def _metric_status(value: float) -> str:
    """Return 'good', 'moderate', or 'poor' based on metric value."""
    if value >= 0.8:
        return "good"
    if value >= 0.6:
        return "moderate"
    return "poor"


def _round6(value: float) -> float:
    """Round to 6 decimal places, replacing NaN/Inf with 0.0."""
    if value is None or math.isnan(value) or math.isinf(value):
        return 0.0
    return round(value, 6)


def _to_float_list(arr: np.ndarray) -> List[float]:
    """Convert numpy array to a list of clean Python floats."""
    return [_round6(float(v)) for v in arr]


def _cast_param(pdef: HyperparamDef, value: Any) -> Any:
    """Cast a hyperparameter value to the correct Python type."""
    if pdef.type == "int":
        return int(value)
    if pdef.type == "float":
        return float(value)
    # "select" — return as string
    return value
