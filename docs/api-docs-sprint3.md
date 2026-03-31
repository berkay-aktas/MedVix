# MedVix API Documentation — Sprint 3

**API Version**: 0.1.0
**Base URL**: `http://localhost:8000`
**Framework**: FastAPI 0.110.x
**Content-Type**: `application/json` (all requests and responses unless noted)
**Sprint Coverage**: Sprint 3 — Steps 4-5 (Model Training & Results)

Interactive documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Authentication

Sprint 3 does not implement authentication. All endpoints are open. Session identity is managed via `session_id` UUID tokens returned by the upload/builtin endpoints (Sprint 2) and passed as query parameters or request body fields by the client. These tokens do not provide security guarantees and are designed for single-user local development.

---

## Common Response Patterns

### Success Response

All successful responses return HTTP 2xx with a JSON body matching the declared Pydantic model.

### Error Response

All error responses follow FastAPI's standard error format:

```json
{
  "detail": "Human-readable error message",
  "error_code": "ERROR_CODE_STRING"
}
```

`error_code` is present on internally caught exceptions (ValueError -> `VALIDATION_ERROR`, unhandled -> `INTERNAL_ERROR`). Standard HTTPException responses include only `detail`.

### HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request — unknown model type, data not prepared, no models trained |
| 404 | Not Found — session not found |
| 422 | Unprocessable Entity — Pydantic validation error |
| 500 | Internal Server Error — unhandled exception |

---

## Prerequisites

All Sprint 3 endpoints require a session that has completed the data preparation step (Sprint 2, `POST /api/data/prepare` with `data_ready: true`). Attempting to train a model on an unprepared session returns HTTP 400.

**State Machine** (continued from Sprint 2):

```
[Prepared / Step 4 Ready] --> [Model Trained] --> [Models Comparable]
                                (POST /ml/train)    (POST /ml/compare)
```

---

## Endpoints

---

### 1. Get Hyperparameter Definitions

#### `GET /api/ml/hyperparams/{model_type}`

Returns the tunable hyperparameters, their types, ranges, defaults, and descriptions for the requested model. Used by the frontend to dynamically render sliders, dropdowns, and input controls in Step 4.

**Tags**: Model Training

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model_type` | string | Yes | Model identifier. One of: `knn`, `svm`, `decision_tree`, `random_forest`, `logistic_regression`, `naive_bayes`, `xgboost`, `lightgbm` |

**Response Schema** (`HyperparamsResponse`):

```json
{
  "model_type": "string",
  "model_name": "string",
  "description": "string",
  "difficulty": "beginner | intermediate | advanced",
  "params": [
    {
      "name": "string",
      "label": "string",
      "type": "int | float | select",
      "min": "number | null",
      "max": "number | null",
      "step": "number | null",
      "default": "any",
      "options": ["string"] | null,
      "description": "string"
    }
  ]
}
```

**Field Descriptions**:

| Field | Type | Description |
|-------|------|-------------|
| `model_type` | string | The model identifier slug passed in the URL |
| `model_name` | string | Human-readable model name (e.g., `"K-Nearest Neighbours"`) |
| `description` | string | One-sentence explanation of how the model works |
| `difficulty` | enum | Difficulty level: `"beginner"`, `"intermediate"`, or `"advanced"` |
| `params` | array | List of tunable hyperparameter definitions |
| `params[].name` | string | Parameter name passed to scikit-learn (e.g., `"n_neighbors"`) |
| `params[].label` | string | Human-readable label for the frontend control |
| `params[].type` | enum | Widget type: `"int"` (integer slider), `"float"` (decimal slider), or `"select"` (dropdown) |
| `params[].min` | number / null | Minimum value for `int` and `float` types; `null` for `select` |
| `params[].max` | number / null | Maximum value for `int` and `float` types; `null` for `select` |
| `params[].step` | number / null | Slider step increment; `0` indicates log-scale (frontend should use log slider) |
| `params[].default` | any | Default value used if user does not adjust this parameter |
| `params[].options` | string[] / null | Available choices for `select`-type params; `null` for numeric types |
| `params[].description` | string | Plain-language explanation of the parameter |

**Example Request**:

```bash
curl http://localhost:8000/api/ml/hyperparams/knn
```

**Example Response** (HTTP 200):

```json
{
  "model_type": "knn",
  "model_name": "K-Nearest Neighbours",
  "description": "Classifies samples by majority vote of their k closest neighbours in feature space.",
  "difficulty": "beginner",
  "params": [
    {
      "name": "n_neighbors",
      "label": "Number of Neighbours (k)",
      "type": "int",
      "min": 1,
      "max": 50,
      "step": 2,
      "default": 5,
      "options": null,
      "description": "Number of nearest neighbours to consider for voting."
    },
    {
      "name": "metric",
      "label": "Distance Metric",
      "type": "select",
      "min": null,
      "max": null,
      "step": null,
      "default": "euclidean",
      "options": ["euclidean", "manhattan", "minkowski"],
      "description": "The distance function used to find neighbours."
    },
    {
      "name": "weights",
      "label": "Weight Function",
      "type": "select",
      "min": null,
      "max": null,
      "step": null,
      "default": "uniform",
      "options": ["uniform", "distance"],
      "description": "Whether closer neighbours have more influence (distance) or all neighbours count equally (uniform)."
    }
  ]
}
```

**Error Responses**:

| Status | Condition | Example Detail |
|--------|-----------|---------------|
| 400 | Unknown model type | `"Unknown model type: 'abc'. Valid types: knn, svm, decision_tree, random_forest, logistic_regression, naive_bayes, xgboost, lightgbm"` |

---

### 2. Train a Model

#### `POST /api/ml/train`

Trains the specified model on the session's prepared data, computes all evaluation metrics, confusion matrix, ROC/PR curves, and cross-validation scores. The trained model is stored in the session for later comparison and explainability (Sprint 4).

**Tags**: Model Training

**Prerequisite**: Session must have completed data preparation (`POST /api/data/prepare` with `data_ready: true`).

**Request Body** (`TrainRequest`):

```json
{
  "session_id": "string (UUID)",
  "model_type": "string",
  "hyperparams": {}
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `session_id` | string | Yes | Active session ID from upload or builtin |
| `model_type` | string | Yes | Model identifier: `knn`, `svm`, `decision_tree`, `random_forest`, `logistic_regression`, `naive_bayes`, `xgboost`, `lightgbm` |
| `hyperparams` | object | No | Key-value pairs of hyperparameter overrides. Omitted params use model defaults. Keys must match `params[].name` from `GET /api/ml/hyperparams/{model_type}` |

**Response Schema** (`TrainResponse`):

```json
{
  "model_id": "string (UUID)",
  "model_type": "string",
  "model_name": "string",
  "metrics": [
    {
      "name": "string",
      "value": "number (0-1)",
      "label": "string",
      "description": "string",
      "status": "good | moderate | poor",
      "is_priority": "boolean"
    }
  ],
  "confusion_matrix": {
    "matrix": [[0, 0], [0, 0]],
    "labels": ["string"]
  },
  "roc_curve": {
    "fpr": ["number"],
    "tpr": ["number"],
    "auc": "number"
  } | null,
  "pr_curve": {
    "precision_values": ["number"],
    "recall_values": ["number"],
    "auc": "number"
  } | null,
  "cross_validation": {
    "fold_scores": ["number"],
    "mean": "number",
    "std": "number",
    "n_folds": "integer"
  },
  "training_time_ms": "integer",
  "hyperparams": {},
  "train_accuracy": "number (0-1)",
  "test_accuracy": "number (0-1)",
  "overfit_warning": "string | null"
}
```

**Field Descriptions**:

| Field | Type | Description |
|-------|------|-------------|
| `model_id` | string | UUID assigned to this trained model instance |
| `model_type` | string | Model identifier slug |
| `model_name` | string | Human-readable model name |
| `metrics` | array | The 6 evaluation metrics (accuracy, sensitivity, specificity, precision, f1_score, auc_roc) |
| `metrics[].name` | string | Machine-readable metric key |
| `metrics[].value` | number | Metric value between 0 and 1 |
| `metrics[].label` | string | Display-friendly label (e.g., `"Sensitivity (Recall)"`) |
| `metrics[].description` | string | Clinical explanation of the metric |
| `metrics[].status` | enum | Visual status: `"good"` (>= 0.8), `"moderate"` (0.6-0.8), `"poor"` (< 0.6) |
| `metrics[].is_priority` | boolean | `true` for sensitivity -- the most critical metric in healthcare screening |
| `confusion_matrix.matrix` | int[][] | 2D array of counts, shape `[n_classes x n_classes]` |
| `confusion_matrix.labels` | string[] | Class labels in the same order as matrix rows/columns |
| `roc_curve` | object / null | ROC curve data; `null` for multiclass problems without OvR support |
| `roc_curve.fpr` | float[] | False positive rates at each threshold |
| `roc_curve.tpr` | float[] | True positive rates at each threshold |
| `roc_curve.auc` | float | Area under the ROC curve |
| `pr_curve` | object / null | Precision-Recall curve data; `null` when not applicable |
| `pr_curve.precision_values` | float[] | Precision at each threshold |
| `pr_curve.recall_values` | float[] | Recall at each threshold |
| `pr_curve.auc` | float | Area under the Precision-Recall curve |
| `cross_validation` | object | Stratified k-fold cross-validation summary |
| `cross_validation.fold_scores` | float[] | Accuracy score for each fold |
| `cross_validation.mean` | float | Mean accuracy across all folds |
| `cross_validation.std` | float | Standard deviation across folds |
| `cross_validation.n_folds` | int | Number of folds used (typically 5) |
| `training_time_ms` | int | Wall-clock training time in milliseconds |
| `hyperparams` | object | The actual hyperparameters used (including defaults for omitted params) |
| `train_accuracy` | float | Accuracy on the training set |
| `test_accuracy` | float | Accuracy on the test set |
| `overfit_warning` | string / null | Warning message if train accuracy exceeds test accuracy by a significant margin; `null` if no concern |

**Example Request**:

```bash
curl -X POST "http://localhost:8000/api/ml/train" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "a3f2b1c4-8d9e-4f1a-b2c3-d4e5f6a7b8c9",
    "model_type": "random_forest",
    "hyperparams": {
      "n_estimators": 200,
      "max_depth": 8,
      "criterion": "gini"
    }
  }'
```

**Example Response** (HTTP 200):

```json
{
  "model_id": "e7a1c3d5-2f4b-4a6c-8e0d-9f1b3c5d7e9a",
  "model_type": "random_forest",
  "model_name": "Random Forest",
  "metrics": [
    {
      "name": "accuracy",
      "value": 0.836,
      "label": "Accuracy",
      "description": "Percentage of all test patients correctly classified.",
      "status": "good",
      "is_priority": false
    },
    {
      "name": "sensitivity",
      "value": 0.879,
      "label": "Sensitivity (Recall)",
      "description": "Of patients WITH the condition, how many were correctly identified?",
      "status": "good",
      "is_priority": true
    },
    {
      "name": "specificity",
      "value": 0.786,
      "label": "Specificity",
      "description": "Of patients WITHOUT the condition, how many were correctly identified as safe?",
      "status": "moderate",
      "is_priority": false
    },
    {
      "name": "precision",
      "value": 0.806,
      "label": "Precision",
      "description": "Of patients flagged high-risk, how many actually had the condition?",
      "status": "good",
      "is_priority": false
    },
    {
      "name": "f1_score",
      "value": 0.841,
      "label": "F1 Score",
      "description": "Harmonic mean of Sensitivity and Precision, balancing both.",
      "status": "good",
      "is_priority": false
    },
    {
      "name": "auc_roc",
      "value": 0.902,
      "label": "AUC-ROC",
      "description": "Overall ability to separate high-risk from low-risk patients (0.5 = chance, 1.0 = perfect).",
      "status": "good",
      "is_priority": false
    }
  ],
  "confusion_matrix": {
    "matrix": [[22, 6], [4, 29]],
    "labels": ["0", "1"]
  },
  "roc_curve": {
    "fpr": [0.0, 0.036, 0.107, 0.214, 0.357, 0.571, 0.786, 1.0],
    "tpr": [0.0, 0.515, 0.697, 0.818, 0.909, 0.970, 1.0, 1.0],
    "auc": 0.902
  },
  "pr_curve": {
    "precision_values": [1.0, 0.943, 0.892, 0.846, 0.806, 0.769, 0.733, 0.541],
    "recall_values": [0.0, 0.303, 0.515, 0.667, 0.758, 0.879, 0.970, 1.0],
    "auc": 0.887
  },
  "cross_validation": {
    "fold_scores": [0.813, 0.854, 0.792, 0.833, 0.851],
    "mean": 0.829,
    "std": 0.024,
    "n_folds": 5
  },
  "training_time_ms": 142,
  "hyperparams": {
    "n_estimators": 200,
    "max_depth": 8,
    "criterion": "gini"
  },
  "train_accuracy": 0.967,
  "test_accuracy": 0.836,
  "overfit_warning": "Train accuracy (96.7%) is significantly higher than test accuracy (83.6%). The model may be overfitting. Consider reducing max_depth or increasing regularisation."
}
```

**Error Responses**:

| Status | Condition | Example Detail |
|--------|-----------|---------------|
| 404 | Session not found | `"Session not found."` |
| 400 | Data not prepared | `"Data has not been prepared. Please complete Step 3 first."` |
| 400 | Invalid model type | `"Unknown model type: 'abc'. Valid types: knn, svm, decision_tree, random_forest, logistic_regression, naive_bayes, xgboost, lightgbm"` |

---

### 3. List Trained Models

#### `GET /api/ml/models`

Returns lightweight summaries of every model trained so far in the given session. Used by the frontend to populate the comparison table in Step 4 and the model selector in Steps 5-6.

**Tags**: Model Training

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session_id` | string | Yes | Active session ID |

**Response Schema** (`List[TrainedModelSummary]`):

```json
[
  {
    "model_id": "string (UUID)",
    "model_type": "string",
    "model_name": "string",
    "metrics": [
      {
        "name": "string",
        "value": "number (0-1)",
        "label": "string",
        "description": "string",
        "status": "good | moderate | poor",
        "is_priority": "boolean"
      }
    ],
    "training_time_ms": "integer",
    "hyperparams": {}
  }
]
```

**Field Descriptions**:

| Field | Type | Description |
|-------|------|-------------|
| `model_id` | string | UUID of the trained model |
| `model_type` | string | Model identifier slug |
| `model_name` | string | Human-readable model name |
| `metrics` | array | The 6 evaluation metrics (same schema as `TrainResponse.metrics`) |
| `training_time_ms` | int | Wall-clock training time in milliseconds |
| `hyperparams` | object | Hyperparameters used for this model |

The response is an empty array `[]` if no models have been trained yet.

**Example Request**:

```bash
curl "http://localhost:8000/api/ml/models?session_id=a3f2b1c4-8d9e-4f1a-b2c3-d4e5f6a7b8c9"
```

**Example Response** (HTTP 200, 2 trained models):

```json
[
  {
    "model_id": "e7a1c3d5-2f4b-4a6c-8e0d-9f1b3c5d7e9a",
    "model_type": "random_forest",
    "model_name": "Random Forest",
    "metrics": [
      {"name": "accuracy", "value": 0.836, "label": "Accuracy", "description": "Percentage of all test patients correctly classified.", "status": "good", "is_priority": false},
      {"name": "sensitivity", "value": 0.879, "label": "Sensitivity (Recall)", "description": "Of patients WITH the condition, how many were correctly identified?", "status": "good", "is_priority": true},
      {"name": "specificity", "value": 0.786, "label": "Specificity", "description": "Of patients WITHOUT the condition, how many were correctly identified as safe?", "status": "moderate", "is_priority": false},
      {"name": "precision", "value": 0.806, "label": "Precision", "description": "Of patients flagged high-risk, how many actually had the condition?", "status": "good", "is_priority": false},
      {"name": "f1_score", "value": 0.841, "label": "F1 Score", "description": "Harmonic mean of Sensitivity and Precision, balancing both.", "status": "good", "is_priority": false},
      {"name": "auc_roc", "value": 0.902, "label": "AUC-ROC", "description": "Overall ability to separate high-risk from low-risk patients (0.5 = chance, 1.0 = perfect).", "status": "good", "is_priority": false}
    ],
    "training_time_ms": 142,
    "hyperparams": {"n_estimators": 200, "max_depth": 8, "criterion": "gini"}
  },
  {
    "model_id": "c2d3e4f5-6a7b-8c9d-0e1f-2a3b4c5d6e7f",
    "model_type": "logistic_regression",
    "model_name": "Logistic Regression",
    "metrics": [
      {"name": "accuracy", "value": 0.803, "label": "Accuracy", "description": "Percentage of all test patients correctly classified.", "status": "good", "is_priority": false},
      {"name": "sensitivity", "value": 0.818, "label": "Sensitivity (Recall)", "description": "Of patients WITH the condition, how many were correctly identified?", "status": "good", "is_priority": true},
      {"name": "specificity", "value": 0.786, "label": "Specificity", "description": "Of patients WITHOUT the condition, how many were correctly identified as safe?", "status": "moderate", "is_priority": false},
      {"name": "precision", "value": 0.794, "label": "Precision", "description": "Of patients flagged high-risk, how many actually had the condition?", "status": "moderate", "is_priority": false},
      {"name": "f1_score", "value": 0.806, "label": "F1 Score", "description": "Harmonic mean of Sensitivity and Precision, balancing both.", "status": "good", "is_priority": false},
      {"name": "auc_roc", "value": 0.871, "label": "AUC-ROC", "description": "Overall ability to separate high-risk from low-risk patients (0.5 = chance, 1.0 = perfect).", "status": "good", "is_priority": false}
    ],
    "training_time_ms": 23,
    "hyperparams": {"C": 1.0, "solver": "lbfgs"}
  }
]
```

**Error Responses**:

| Status | Condition | Example Detail |
|--------|-----------|---------------|
| 404 | Session not found | `"Session not found."` |

---

### 4. Compare Trained Models

#### `POST /api/ml/compare`

Returns a side-by-side comparison of all trained models in the session, identifying the best model overall and the best model per metric. Used by the frontend to render the comparison table in Step 4.

**Tags**: Model Training

**Request Body** (`CompareRequest`):

```json
{
  "session_id": "string (UUID)"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `session_id` | string | Yes | Active session ID |

**Response Schema** (`ComparisonResponse`):

```json
{
  "models": [
    {
      "model_id": "string (UUID)",
      "model_type": "string",
      "model_name": "string",
      "metrics": [
        {
          "name": "string",
          "value": "number (0-1)",
          "label": "string",
          "description": "string",
          "status": "good | moderate | poor",
          "is_priority": "boolean"
        }
      ],
      "training_time_ms": "integer",
      "hyperparams": {}
    }
  ],
  "best_model_id": "string (UUID) | null",
  "best_by_metric": {
    "metric_name": "model_id"
  }
}
```

**Field Descriptions**:

| Field | Type | Description |
|-------|------|-------------|
| `models` | array | All trained models in the session (same schema as `TrainedModelSummary`) |
| `best_model_id` | string / null | UUID of the overall best model (highest F1 score); `null` if no models trained |
| `best_by_metric` | object | Maps each metric name to the `model_id` that scored highest on it |

**Example Request**:

```bash
curl -X POST "http://localhost:8000/api/ml/compare" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "a3f2b1c4-8d9e-4f1a-b2c3-d4e5f6a7b8c9"}'
```

**Example Response** (HTTP 200):

```json
{
  "models": [
    {
      "model_id": "e7a1c3d5-2f4b-4a6c-8e0d-9f1b3c5d7e9a",
      "model_type": "random_forest",
      "model_name": "Random Forest",
      "metrics": [
        {"name": "accuracy", "value": 0.836, "label": "Accuracy", "description": "Percentage of all test patients correctly classified.", "status": "good", "is_priority": false},
        {"name": "sensitivity", "value": 0.879, "label": "Sensitivity (Recall)", "description": "Of patients WITH the condition, how many were correctly identified?", "status": "good", "is_priority": true},
        {"name": "specificity", "value": 0.786, "label": "Specificity", "description": "Of patients WITHOUT the condition, how many were correctly identified as safe?", "status": "moderate", "is_priority": false},
        {"name": "precision", "value": 0.806, "label": "Precision", "description": "Of patients flagged high-risk, how many actually had the condition?", "status": "good", "is_priority": false},
        {"name": "f1_score", "value": 0.841, "label": "F1 Score", "description": "Harmonic mean of Sensitivity and Precision, balancing both.", "status": "good", "is_priority": false},
        {"name": "auc_roc", "value": 0.902, "label": "AUC-ROC", "description": "Overall ability to separate high-risk from low-risk patients (0.5 = chance, 1.0 = perfect).", "status": "good", "is_priority": false}
      ],
      "training_time_ms": 142,
      "hyperparams": {"n_estimators": 200, "max_depth": 8, "criterion": "gini"}
    },
    {
      "model_id": "c2d3e4f5-6a7b-8c9d-0e1f-2a3b4c5d6e7f",
      "model_type": "logistic_regression",
      "model_name": "Logistic Regression",
      "metrics": [
        {"name": "accuracy", "value": 0.803, "label": "Accuracy", "description": "Percentage of all test patients correctly classified.", "status": "good", "is_priority": false},
        {"name": "sensitivity", "value": 0.818, "label": "Sensitivity (Recall)", "description": "Of patients WITH the condition, how many were correctly identified?", "status": "good", "is_priority": true},
        {"name": "specificity", "value": 0.786, "label": "Specificity", "description": "Of patients WITHOUT the condition, how many were correctly identified as safe?", "status": "moderate", "is_priority": false},
        {"name": "precision", "value": 0.794, "label": "Precision", "description": "Of patients flagged high-risk, how many actually had the condition?", "status": "moderate", "is_priority": false},
        {"name": "f1_score", "value": 0.806, "label": "F1 Score", "description": "Harmonic mean of Sensitivity and Precision, balancing both.", "status": "good", "is_priority": false},
        {"name": "auc_roc", "value": 0.871, "label": "AUC-ROC", "description": "Overall ability to separate high-risk from low-risk patients (0.5 = chance, 1.0 = perfect).", "status": "good", "is_priority": false}
      ],
      "training_time_ms": 23,
      "hyperparams": {"C": 1.0, "solver": "lbfgs"}
    }
  ],
  "best_model_id": "e7a1c3d5-2f4b-4a6c-8e0d-9f1b3c5d7e9a",
  "best_by_metric": {
    "accuracy": "e7a1c3d5-2f4b-4a6c-8e0d-9f1b3c5d7e9a",
    "sensitivity": "e7a1c3d5-2f4b-4a6c-8e0d-9f1b3c5d7e9a",
    "specificity": "e7a1c3d5-2f4b-4a6c-8e0d-9f1b3c5d7e9a",
    "precision": "e7a1c3d5-2f4b-4a6c-8e0d-9f1b3c5d7e9a",
    "f1_score": "e7a1c3d5-2f4b-4a6c-8e0d-9f1b3c5d7e9a",
    "auc_roc": "e7a1c3d5-2f4b-4a6c-8e0d-9f1b3c5d7e9a"
  }
}
```

**Error Responses**:

| Status | Condition | Example Detail |
|--------|-----------|---------------|
| 404 | Session not found | `"Session not found."` |
| 400 | No models trained yet | `"No models have been trained in this session. Please train at least one model first."` |

---

## Session Lifecycle (Sprint 3 Additions)

Sessions created in Sprint 2 continue into Sprint 3. Trained models are stored as part of the session state.

| Property | Value |
|----------|-------|
| Session TTL | 60 minutes from last access |
| Session Storage | In-memory dictionary (not persisted across restarts) |
| Models Per Session | No hard limit; each `POST /api/ml/train` adds a model |
| Model Storage | Trained scikit-learn model objects held in memory |

**Extended State Machine**:

```
[Created] --> [Data Loaded] --> [Column Mapping Validated] --> [Prepared] --> [Model Trained] --> [Comparable]
               (POST /upload     (POST /column-mapping           (POST /prepare  (POST /ml/train   (POST /ml/compare
                or /builtin)      schema_ok=true)                 data_ready=true) model_id returned) 2+ models)
```

---

## Model Types Reference

All 8 supported model types with their hyperparameters.

---

### KNN (`knn`)

**Name**: K-Nearest Neighbours
**Difficulty**: Beginner
**Description**: Classifies samples by majority vote of their k closest neighbours in feature space.

| Parameter | Label | Type | Min | Max | Step | Default | Options |
|-----------|-------|------|-----|-----|------|---------|---------|
| `n_neighbors` | Number of Neighbours (k) | int | 1 | 50 | 2 | 5 | -- |
| `metric` | Distance Metric | select | -- | -- | -- | `euclidean` | `euclidean`, `manhattan`, `minkowski` |
| `weights` | Weight Function | select | -- | -- | -- | `uniform` | `uniform`, `distance` |

---

### SVM (`svm`)

**Name**: Support Vector Machine
**Difficulty**: Intermediate
**Description**: Finds the optimal hyperplane that maximally separates classes in high-dimensional space.

| Parameter | Label | Type | Min | Max | Step | Default | Options |
|-----------|-------|------|-----|-----|------|---------|---------|
| `kernel` | Kernel Function | select | -- | -- | -- | `rbf` | `linear`, `rbf`, `poly` |
| `C` | Regularisation (C) | float | 0.01 | 100.0 | 0.1 | 1.0 | -- |
| `gamma` | Gamma | select | -- | -- | -- | `scale` | `scale`, `auto` |

---

### Decision Tree (`decision_tree`)

**Name**: Decision Tree
**Difficulty**: Beginner
**Description**: Builds a tree of if/else rules by recursively splitting on the most informative features.

| Parameter | Label | Type | Min | Max | Step | Default | Options |
|-----------|-------|------|-----|-----|------|---------|---------|
| `max_depth` | Maximum Tree Depth | int | 1 | 30 | 1 | 10 | -- |
| `criterion` | Split Criterion | select | -- | -- | -- | `gini` | `gini`, `entropy` |
| `min_samples_split` | Min Samples to Split | int | 2 | 20 | 1 | 2 | -- |

---

### Random Forest (`random_forest`)

**Name**: Random Forest
**Difficulty**: Intermediate
**Description**: Ensemble of decision trees trained on random subsets of data, reducing overfitting through averaging.

| Parameter | Label | Type | Min | Max | Step | Default | Options |
|-----------|-------|------|-----|-----|------|---------|---------|
| `n_estimators` | Number of Trees | int | 10 | 500 | 10 | 100 | -- |
| `max_depth` | Maximum Tree Depth | int | 1 | 30 | 1 | 10 | -- |
| `criterion` | Split Criterion | select | -- | -- | -- | `gini` | `gini`, `entropy` |

---

### Logistic Regression (`logistic_regression`)

**Name**: Logistic Regression
**Difficulty**: Beginner
**Description**: Linear model that estimates class probabilities using a logistic (sigmoid) function.

| Parameter | Label | Type | Min | Max | Step | Default | Options |
|-----------|-------|------|-----|-----|------|---------|---------|
| `C` | Inverse Regularisation (C) | float | 0.01 | 100.0 | 0.1 | 1.0 | -- |
| `solver` | Solver Algorithm | select | -- | -- | -- | `lbfgs` | `lbfgs`, `liblinear`, `saga` |

---

### Naive Bayes (`naive_bayes`)

**Name**: Gaussian Naive Bayes
**Difficulty**: Beginner
**Description**: Probabilistic classifier assuming feature independence -- uses minimal tuning, adjust smoothing if needed.

| Parameter | Label | Type | Min | Max | Step | Default | Options |
|-----------|-------|------|-----|-----|------|---------|---------|
| `var_smoothing` | Variance Smoothing | float | 1e-12 | 1e-6 | 0 (log scale) | 1e-9 | -- |

Note: `step: 0` indicates log-scale. The frontend should render a logarithmic slider for this parameter.

---

### XGBoost (`xgboost`)

**Name**: XGBoost
**Difficulty**: Advanced
**Description**: Gradient-boosted decision trees optimised for speed and performance -- a top choice in competitions and production.

| Parameter | Label | Type | Min | Max | Step | Default | Options |
|-----------|-------|------|-----|-----|------|---------|---------|
| `n_estimators` | Number of Boosting Rounds | int | 10 | 500 | 10 | 100 | -- |
| `max_depth` | Maximum Tree Depth | int | 3 | 15 | 1 | 6 | -- |
| `learning_rate` | Learning Rate | float | 0.01 | 1.0 | 0.01 | 0.1 | -- |

Note: XGBoost is lazily imported. First request may take slightly longer due to library loading.

---

### LightGBM (`lightgbm`)

**Name**: LightGBM
**Difficulty**: Advanced
**Description**: Fast gradient-boosting framework using histogram-based learning -- efficient on large datasets.

| Parameter | Label | Type | Min | Max | Step | Default | Options |
|-----------|-------|------|-----|-----|------|---------|---------|
| `n_estimators` | Number of Boosting Rounds | int | 10 | 500 | 10 | 100 | -- |
| `max_depth` | Maximum Tree Depth | int | 3 | 15 | 1 | 6 | -- |
| `learning_rate` | Learning Rate | float | 0.01 | 1.0 | 0.01 | 0.1 | -- |

Note: LightGBM is lazily imported. First request may take slightly longer due to library loading.
