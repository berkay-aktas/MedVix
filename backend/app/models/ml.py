"""Pydantic models for Steps 4-5 — Model Training & Results."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class HyperparamDef(BaseModel):
    """Definition of a single tunable hyperparameter for the frontend sliders."""

    name: str
    label: str
    type: str = Field(
        ..., description='Parameter widget type: "int", "float", or "select"'
    )
    min: Optional[float] = None
    max: Optional[float] = None
    step: Optional[float] = None
    default: Any
    options: Optional[List[str]] = Field(
        default=None, description="Available choices for select-type params"
    )
    description: str = ""


class HyperparamsResponse(BaseModel):
    """Full hyperparameter schema for a given model type."""

    model_type: str
    model_name: str
    description: str
    difficulty: str = Field(
        ..., description='Difficulty level: "beginner", "intermediate", or "advanced"'
    )
    params: List[HyperparamDef]


class TrainRequest(BaseModel):
    """Request body for the /api/ml/train endpoint."""

    session_id: str
    model_type: str = Field(
        ...,
        description=(
            "Model identifier: knn, svm, decision_tree, random_forest, "
            "logistic_regression, naive_bayes, xgboost, lightgbm"
        ),
    )
    hyperparams: Dict[str, Any] = Field(default_factory=dict)


class MetricValue(BaseModel):
    """A single evaluation metric with display metadata."""

    name: str
    value: float
    label: str
    description: str
    status: str = Field(
        ...,
        description='Visual status: "good" (>=0.8), "moderate" (0.6-0.8), "poor" (<0.6)',
    )
    is_priority: bool = Field(
        default=False,
        description="True for sensitivity — the most critical metric in healthcare",
    )


class ConfusionMatrixData(BaseModel):
    """Confusion matrix values and class labels."""

    matrix: List[List[int]]
    labels: List[str]


class ROCCurveData(BaseModel):
    """ROC curve plot data."""

    fpr: List[float]
    tpr: List[float]
    auc: float


class PRCurveData(BaseModel):
    """Precision-Recall curve plot data."""

    precision_values: List[float]
    recall_values: List[float]
    auc: float


class CrossValidationData(BaseModel):
    """Stratified k-fold cross-validation summary."""

    fold_scores: List[float]
    mean: float
    std: float
    n_folds: int


class TrainedModelSummary(BaseModel):
    """Lightweight summary used in model comparison lists."""

    model_id: str
    model_type: str
    model_name: str
    metrics: List[MetricValue]
    training_time_ms: int
    hyperparams: Dict[str, Any]


class TrainResponse(BaseModel):
    """Full training result returned from POST /api/ml/train."""

    model_id: str
    model_type: str
    model_name: str
    metrics: List[MetricValue]
    confusion_matrix: ConfusionMatrixData
    roc_curve: Optional[ROCCurveData] = None
    pr_curve: Optional[PRCurveData] = None
    cross_validation: CrossValidationData
    training_time_ms: int
    hyperparams: Dict[str, Any]
    train_accuracy: float
    test_accuracy: float
    overfit_warning: Optional[str] = None


class CompareRequest(BaseModel):
    """Request body for model comparison."""

    session_id: str


class ComparisonResponse(BaseModel):
    """Side-by-side comparison of all trained models in a session."""

    models: List[TrainedModelSummary]
    best_model_id: Optional[str] = None
    best_by_metric: Dict[str, str] = Field(
        default_factory=dict,
        description="Mapping of metric_name -> model_id of the best performer",
    )
