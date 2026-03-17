# MedVix API Documentation — Sprint 2

**API Version**: 0.1.0
**Base URL**: `http://localhost:8000`
**Framework**: FastAPI 0.110.x
**Content-Type**: `application/json` (all requests and responses unless noted)
**Sprint Coverage**: Sprint 2 — Steps 1-3 (Clinical Context, Data Exploration, Data Preparation)

Interactive documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Authentication

Sprint 2 does not implement authentication. All endpoints are open. Session identity is managed via `session_id` UUID tokens returned by the upload/builtin endpoints and passed as query parameters or request body fields by the client. These tokens do not provide security guarantees and are designed for single-user local development.

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

`error_code` is present on internally caught exceptions (ValueError → `VALIDATION_ERROR`, unhandled → `INTERNAL_ERROR`). Standard HTTPException responses include only `detail`.

### HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request — domain unknown, schema not validated, no data loaded |
| 404 | Not Found — session or domain not found |
| 413 | Request Entity Too Large — file exceeds 50 MB |
| 422 | Unprocessable Entity — CSV parse error, row count too low, no numeric columns; also Pydantic validation error |
| 500 | Internal Server Error — unhandled exception |

---

## Endpoints

---

### 1. Health Check

#### `GET /health`

Returns the API operational status.

**Tags**: Health

**Request**: No parameters.

**Response Schema**:

```json
{
  "status": "string"
}
```

**Example Request**:

```bash
curl http://localhost:8000/health
```

**Example Response** (HTTP 200):

```json
{
  "status": "ok"
}
```

**Error Codes**: None. If this endpoint returns anything other than `{"status": "ok"}` with HTTP 200, the server is not healthy.

---

### 2. List All Clinical Domains

#### `GET /api/domains`

Returns summary information for all 20 clinical domains available in MedVix.

**Tags**: Clinical Context

**Request**: No parameters.

**Response Schema** (`DomainListResponse`):

```json
{
  "domains": [
    {
      "id": "string",
      "name": "string",
      "icon": "string",
      "short_description": "string",
      "dataset_name": "string",
      "target_variable": "string",
      "problem_type": "binary | multiclass"
    }
  ],
  "count": "integer"
}
```

**Field Descriptions**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | URL-safe slug (e.g., `"cardiology"`, `"oncology-breast"`) |
| `name` | string | Human-readable domain name (e.g., `"Heart Disease"`) |
| `icon` | string | Emoji icon for the domain card |
| `short_description` | string | One-sentence clinical use-case summary |
| `dataset_name` | string | Built-in CSV filename without extension |
| `target_variable` | string | Name of the target column in the dataset |
| `problem_type` | enum | `"binary"` or `"multiclass"` |
| `count` | integer | Total number of domains (always 20 in Sprint 2) |

**Example Request**:

```bash
curl http://localhost:8000/api/domains
```

**Example Response** (HTTP 200, truncated to 2 domains):

```json
{
  "domains": [
    {
      "id": "cardiology",
      "name": "Heart Disease",
      "icon": "❤️",
      "short_description": "Predict the presence of heart disease from clinical and test results.",
      "dataset_name": "heart",
      "target_variable": "target",
      "problem_type": "binary"
    },
    {
      "id": "endocrinology",
      "name": "Diabetes",
      "icon": "🩸",
      "short_description": "Predict diabetes onset from diagnostic measures.",
      "dataset_name": "diabetes",
      "target_variable": "Outcome",
      "problem_type": "binary"
    }
  ],
  "count": 20
}
```

**Error Codes**: None.

---

### 3. Get Domain Details

#### `GET /api/domains/{domain_id}`

Returns full metadata for a single clinical domain, including clinical context, feature descriptions, and dataset provenance.

**Tags**: Clinical Context

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `domain_id` | string | Yes | Domain slug (e.g., `"cardiology"`, `"nephrology"`) |

**Response Schema** (`DomainDetail`, extends `DomainSummary`):

```json
{
  "id": "string",
  "name": "string",
  "icon": "string",
  "short_description": "string",
  "dataset_name": "string",
  "target_variable": "string",
  "problem_type": "binary | multiclass",
  "clinical_question": "string",
  "why_it_matters": "string",
  "patient_population": "string",
  "ai_limitation_note": "string",
  "feature_names": ["string"],
  "feature_descriptions": {
    "feature_name": "clinical description"
  },
  "target_classes": ["string"],
  "data_source": "string (URL)",
  "dataset_rows": "integer",
  "dataset_features": "integer",
  "positive_rate": "string | null"
}
```

**Additional Field Descriptions**:

| Field | Type | Description |
|-------|------|-------------|
| `clinical_question` | string | The medical question the ML model answers |
| `why_it_matters` | string | Clinical significance, 2-3 sentences |
| `patient_population` | string | Target patient group for this domain |
| `ai_limitation_note` | string | Explicit statement of what AI cannot do here |
| `feature_names` | string[] | Ordered list of feature column names |
| `feature_descriptions` | object | Maps column name to clinical interpretation |
| `target_classes` | string[] | Possible values of the target variable |
| `data_source` | string | URL to the original dataset (Kaggle / UCI) |
| `dataset_rows` | integer | Row count of the built-in CSV |
| `dataset_features` | integer | Feature count (excluding target) |
| `positive_rate` | string | Approximate prevalence of positive class, e.g. `"~54%"` |

**Example Request**:

```bash
curl http://localhost:8000/api/domains/cardiology
```

**Example Response** (HTTP 200):

```json
{
  "id": "cardiology",
  "name": "Heart Disease",
  "icon": "❤️",
  "short_description": "Predict the presence of heart disease from clinical and test results.",
  "dataset_name": "heart",
  "target_variable": "target",
  "problem_type": "binary",
  "clinical_question": "Does this patient have significant coronary artery disease?",
  "why_it_matters": "Cardiovascular disease is the leading cause of death worldwide, accounting for roughly 17.9 million deaths per year. Early identification allows timely intervention with medication, lifestyle changes, or surgical procedures.",
  "patient_population": "Adults aged 29-77 undergoing cardiac evaluation",
  "ai_limitation_note": "AI predictions cannot replace angiography or stress testing. Results should be used as a screening aid, not a definitive diagnosis.",
  "feature_names": ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"],
  "feature_descriptions": {
    "age": "Patient age in years",
    "sex": "Biological sex (1 = male, 0 = female)",
    "cp": "Chest pain type (0-3)",
    "trestbps": "Resting blood pressure in mm Hg on admission",
    "chol": "Serum cholesterol in mg/dL",
    "fbs": "Fasting blood sugar > 120 mg/dL",
    "restecg": "Resting ECG results",
    "thalach": "Maximum heart rate achieved",
    "exang": "Exercise-induced angina",
    "oldpeak": "ST depression induced by exercise",
    "slope": "Slope of peak exercise ST segment",
    "ca": "Number of major vessels colored by fluoroscopy",
    "thal": "Thalassemia type"
  },
  "target_classes": ["0", "1"],
  "data_source": "https://www.kaggle.com/datasets/johnsmith88/heart-disease-dataset",
  "dataset_rows": 303,
  "dataset_features": 13,
  "positive_rate": "~54%"
}
```

**Error Responses**:

| Status | Condition | Example Body |
|--------|-----------|--------------|
| 404 | `domain_id` not found | `{"detail": "Domain 'xyz' not found."}` |

---

### 4. Upload CSV File

#### `POST /api/data/upload`

Uploads a CSV patient dataset, validates it, creates a new session, and returns session metadata.

**Tags**: Data Exploration

**Request**:
- Content-Type: `multipart/form-data`
- Form field `file`: the CSV file
- Query parameter `domain_id`: domain slug the dataset belongs to

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|----------|-------------|
| `file` | form-data | UploadFile | Yes | CSV file to upload |
| `domain_id` | query | string | Yes | Domain the dataset corresponds to |

**Validation Rules**:
1. File extension must be `.csv` (case-insensitive)
2. File size must not exceed 50 MB (52,428,800 bytes)
3. Content must be parseable as CSV
4. CSV must have at least 10 rows
5. CSV must have at least 1 numeric column
6. `domain_id` must exist in the domain registry

**Response Schema** (`UploadResponse`):

```json
{
  "session_id": "string (UUID)",
  "filename": "string",
  "file_size_kb": "number",
  "row_count": "integer",
  "column_count": "integer",
  "message": "string"
}
```

**Example Request**:

```bash
curl -X POST "http://localhost:8000/api/data/upload?domain_id=cardiology" \
  -H "accept: application/json" \
  -F "file=@heart.csv;type=text/csv"
```

**Example Response** (HTTP 200):

```json
{
  "session_id": "a3f2b1c4-8d9e-4f1a-b2c3-d4e5f6a7b8c9",
  "filename": "heart.csv",
  "file_size_kb": 14.38,
  "row_count": 303,
  "column_count": 14,
  "message": "Successfully uploaded heart.csv (303 rows, 14 columns)."
}
```

**Error Responses**:

| Status | Condition | Example Detail |
|--------|-----------|---------------|
| 400 | `domain_id` not found | `"Unknown domain: 'xyz'"` |
| 400 | Wrong file extension | `"Unsupported file type '.xlsx'. Only CSV files are accepted."` |
| 413 | File exceeds 50 MB | `"File size (51.2 MB) exceeds the 50 MB limit."` |
| 422 | CSV parse error | `"Could not parse CSV file: ..."` |
| 422 | Fewer than 10 rows | `"Dataset must contain at least 10 rows, but this file has only 5."` |
| 422 | No numeric columns | `"Dataset must contain at least 1 numeric column(s), but none were found."` |

---

### 5. Load Built-in Dataset

#### `POST /api/data/builtin`

Loads one of the 20 pre-bundled synthetic datasets by domain ID, creates a new session, and returns session metadata.

**Tags**: Data Exploration

**Request Body** (`BuiltinDatasetRequest`):

```json
{
  "domain_id": "string"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `domain_id` | string | Yes | Domain slug to load built-in dataset for |

**Response Schema**: Same as `UploadResponse` (see endpoint 4 above). Note: `file_size_kb` will be `0.0` for built-in datasets.

**Example Request**:

```bash
curl -X POST "http://localhost:8000/api/data/builtin" \
  -H "Content-Type: application/json" \
  -d '{"domain_id": "endocrinology"}'
```

**Example Response** (HTTP 200):

```json
{
  "session_id": "b4c3d2e1-9f0a-4b2c-a3d4-e5f6a7b8c9d0",
  "filename": "diabetes.csv",
  "file_size_kb": 0.0,
  "row_count": 768,
  "column_count": 9,
  "message": "Loaded built-in dataset for Diabetes (768 rows, 9 columns)."
}
```

**Error Responses**:

| Status | Condition | Example Detail |
|--------|-----------|---------------|
| 400 | `domain_id` not found | `"Unknown domain: 'xyz'"` |
| 404 | CSV file missing from `backend/data/` | `"Built-in dataset file 'diabetes.csv' not found."` |

---

### 6. Get Dataset Summary

#### `GET /api/data/summary`

Returns a comprehensive statistical summary of the loaded dataset: per-column statistics with quality tags, class distribution, data quality score, and smart warnings.

**Tags**: Data Exploration

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session_id` | string | Yes | Session ID from upload or builtin |

**Response Schema** (`DataSummary`):

```json
{
  "session_id": "string",
  "row_count": "integer",
  "column_count": "integer",
  "total_missing_pct": "number (0-100)",
  "columns": [
    {
      "name": "string",
      "dtype": "numeric | categorical | binary | identifier | datetime",
      "missing_count": "integer",
      "missing_pct": "number (0-100)",
      "unique_count": "integer",
      "action_tag": "OK | Some Missing | High Missing",
      "action_color": "green | amber | red",
      "sample_values": ["any"],
      "min_val": "number | null",
      "max_val": "number | null"
    }
  ],
  "class_distribution": [
    {
      "class_name": "string",
      "count": "integer",
      "percentage": "number (0-100)"
    }
  ],
  "target_column": "string",
  "is_imbalanced": "boolean",
  "imbalance_warning": "string | null",
  "data_quality_score": "integer (0-100)",
  "warnings": [
    {
      "level": "info | warning | error",
      "message": "string",
      "column": "string | null"
    }
  ]
}
```

**Quality Tag Thresholds**:

| Tag | Color | Condition |
|-----|-------|-----------|
| OK | green | missing % < 5% |
| Some Missing | amber | 5% ≤ missing % < 30% |
| High Missing | red | missing % ≥ 30% |

**Data Quality Score Components** (weighted sum to 100):

| Component | Weight | Description |
|-----------|--------|-------------|
| Completeness | 40 | Proportion of non-null cells |
| No duplicates | 20 | Proportion of unique rows |
| No constant columns | 15 | Proportion of columns with >1 unique value |
| No high cardinality | 15 | Proportion of categorical columns with ≤50 unique values |
| Class balance | 10 | How close to equal class distribution |

**Imbalance Threshold**: Triggered when minority class < 30% of total samples.

**Example Request**:

```bash
curl "http://localhost:8000/api/data/summary?session_id=a3f2b1c4-8d9e-4f1a-b2c3-d4e5f6a7b8c9"
```

**Example Response** (HTTP 200, abbreviated):

```json
{
  "session_id": "a3f2b1c4-8d9e-4f1a-b2c3-d4e5f6a7b8c9",
  "row_count": 303,
  "column_count": 14,
  "total_missing_pct": 0.0,
  "columns": [
    {
      "name": "age",
      "dtype": "numeric",
      "missing_count": 0,
      "missing_pct": 0.0,
      "unique_count": 41,
      "action_tag": "OK",
      "action_color": "green",
      "sample_values": [63, 37, 41, 56, 57],
      "min_val": 29.0,
      "max_val": 77.0
    },
    {
      "name": "target",
      "dtype": "binary",
      "missing_count": 0,
      "missing_pct": 0.0,
      "unique_count": 2,
      "action_tag": "OK",
      "action_color": "green",
      "sample_values": [1, 1, 1, 1, 1],
      "min_val": 0.0,
      "max_val": 1.0
    }
  ],
  "class_distribution": [
    {"class_name": "1", "count": 165, "percentage": 54.46},
    {"class_name": "0", "count": 138, "percentage": 45.54}
  ],
  "target_column": "target",
  "is_imbalanced": false,
  "imbalance_warning": null,
  "data_quality_score": 87,
  "warnings": []
}
```

**Error Responses**:

| Status | Condition | Example Detail |
|--------|-----------|---------------|
| 404 | Session not found | `"Session not found."` |
| 400 | No dataset loaded | `"No dataset loaded in this session."` |

---

### 7. Set Column Mapping

#### `POST /api/data/column-mapping`

Validates and stores the user's column role assignment (feature / target / ignore). Sets `schema_ok` on the session, which gates access to Step 3.

**Tags**: Data Exploration

**Request Body** (`ColumnMapperRequest`):

```json
{
  "session_id": "string",
  "target_column": "string",
  "mappings": [
    {
      "csv_column": "string",
      "role": "feature | target | ignore"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `session_id` | string | Yes | Active session ID |
| `target_column` | string | Yes | Name of the column to use as the ML target |
| `mappings` | array | Yes | Role assignments for all columns |
| `mappings[].csv_column` | string | Yes | Column name from the CSV |
| `mappings[].role` | enum | Yes | `"feature"`, `"target"`, or `"ignore"` |

**Validation Rules** (all must pass for `schema_ok: true`):
1. `target_column` must exist in the dataset
2. `target_column` must have 2-20 unique values (classification target)
3. At least one column must have `role: "feature"`
4. `target_column` must not also appear with `role: "feature"` in mappings
5. All `csv_column` values in mappings must exist in the dataset

**Response Schema** (`ColumnMapperResponse`):

```json
{
  "session_id": "string",
  "target_column": "string",
  "feature_count": "integer",
  "ignored_count": "integer",
  "schema_ok": "boolean",
  "warnings": [
    {
      "level": "info | warning | error",
      "message": "string",
      "column": "string | null"
    }
  ]
}
```

**Example Request**:

```bash
curl -X POST "http://localhost:8000/api/data/column-mapping" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "a3f2b1c4-8d9e-4f1a-b2c3-d4e5f6a7b8c9",
    "target_column": "target",
    "mappings": [
      {"csv_column": "age", "role": "feature"},
      {"csv_column": "sex", "role": "feature"},
      {"csv_column": "cp", "role": "feature"},
      {"csv_column": "trestbps", "role": "feature"},
      {"csv_column": "chol", "role": "feature"},
      {"csv_column": "fbs", "role": "feature"},
      {"csv_column": "restecg", "role": "feature"},
      {"csv_column": "thalach", "role": "feature"},
      {"csv_column": "exang", "role": "feature"},
      {"csv_column": "oldpeak", "role": "feature"},
      {"csv_column": "slope", "role": "feature"},
      {"csv_column": "ca", "role": "feature"},
      {"csv_column": "thal", "role": "feature"},
      {"csv_column": "target", "role": "target"}
    ]
  }'
```

**Example Response** (HTTP 200):

```json
{
  "session_id": "a3f2b1c4-8d9e-4f1a-b2c3-d4e5f6a7b8c9",
  "target_column": "target",
  "feature_count": 13,
  "ignored_count": 0,
  "schema_ok": true,
  "warnings": []
}
```

**Example Response — Validation Failure**:

```json
{
  "session_id": "a3f2b1c4-8d9e-4f1a-b2c3-d4e5f6a7b8c9",
  "target_column": "nonexistent",
  "feature_count": 0,
  "ignored_count": 0,
  "schema_ok": false,
  "warnings": [
    {
      "level": "error",
      "message": "Target column 'nonexistent' not found in the dataset.",
      "column": null
    }
  ]
}
```

> Note: Validation failures return HTTP 200 (not 400). The `schema_ok: false` field signals the failure. This allows the UI to display field-level warnings inline without treating it as an HTTP error.

**Error Responses**:

| Status | Condition | Example Detail |
|--------|-----------|---------------|
| 404 | Session not found | `"Session not found."` |
| 400 | No dataset loaded | `"No dataset loaded in this session."` |

---

### 8. Preview Dataset Rows

#### `GET /api/data/preview`

Returns the first N rows of the loaded dataset as JSON-serialisable records.

**Tags**: Data Exploration

**Query Parameters**:

| Parameter | Type | Required | Default | Constraints | Description |
|-----------|------|----------|---------|-------------|-------------|
| `session_id` | string | Yes | — | — | Active session ID |
| `rows` | integer | No | 5 | 1 ≤ rows ≤ 100 | Number of rows to preview |

**Response Schema** (`DataPreviewResponse`):

```json
{
  "session_id": "string",
  "columns": ["string"],
  "rows": [
    {"column_name": "value"}
  ],
  "total_rows": "integer"
}
```

NaN values are serialised as JSON `null` (never as the string `"NaN"`).

**Example Request**:

```bash
curl "http://localhost:8000/api/data/preview?session_id=a3f2b1c4-8d9e-4f1a-b2c3-d4e5f6a7b8c9&rows=3"
```

**Example Response** (HTTP 200):

```json
{
  "session_id": "a3f2b1c4-8d9e-4f1a-b2c3-d4e5f6a7b8c9",
  "columns": ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal", "target"],
  "rows": [
    {"age": 63, "sex": 1, "cp": 3, "trestbps": 145, "chol": 233, "fbs": 1, "restecg": 0, "thalach": 150, "exang": 0, "oldpeak": 2.3, "slope": 0, "ca": 0, "thal": 1, "target": 1},
    {"age": 37, "sex": 1, "cp": 2, "trestbps": 130, "chol": 250, "fbs": 0, "restecg": 1, "thalach": 187, "exang": 0, "oldpeak": 3.5, "slope": 0, "ca": 0, "thal": 2, "target": 1},
    {"age": 41, "sex": 0, "cp": 1, "trestbps": 130, "chol": 204, "fbs": 0, "restecg": 0, "thalach": 172, "exang": 0, "oldpeak": 1.4, "slope": 2, "ca": 0, "thal": 2, "target": 1}
  ],
  "total_rows": 303
}
```

**Error Responses**:

| Status | Condition | Example Detail |
|--------|-----------|---------------|
| 404 | Session not found | `"Session not found."` |
| 400 | No dataset loaded | `"No dataset loaded in this session."` |
| 422 | `rows` < 1 or > 100 | Pydantic validation error |

---

### 9. Prepare Dataset

#### `POST /api/data/prepare`

Executes the full data preparation pipeline: missing-value handling, target and feature encoding, train/test split, normalisation, and optional SMOTE oversampling. This is the gateway to Step 4 (Model Selection).

**Tags**: Data Preparation

**Prerequisite**: `POST /api/data/column-mapping` must have been called and returned `schema_ok: true` for this session. Without it, this endpoint returns HTTP 400.

**Request Body** (`PreparationConfig`):

```json
{
  "session_id": "string",
  "test_size": "number (0.1 to 0.4)",
  "missing_strategy": "median | mode | remove",
  "normalisation": "zscore | minmax | none",
  "apply_smote": "boolean"
}
```

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `session_id` | string | Yes | — | — | Active session with validated column mapping |
| `test_size` | number | No | 0.2 | 0.1 ≤ value ≤ 0.4 | Fraction of data for test set |
| `missing_strategy` | enum | No | `"median"` | See options | How to handle NaN values |
| `normalisation` | enum | No | `"zscore"` | See options | Feature scaling method |
| `apply_smote` | boolean | No | `false` | — | Whether to oversample minority class |

**Missing Strategy Details**:

| Value | Behavior |
|-------|----------|
| `"median"` | Fill NaN in numeric columns with column median; fill categorical NaN with column mode |
| `"mode"` | Fill all NaN with column mode (most frequent value) |
| `"remove"` | Drop all rows that contain NaN in feature columns; also drops rows where target is NaN |

**Normalisation Details**:

| Value | Behavior |
|-------|----------|
| `"zscore"` | StandardScaler: subtract mean, divide by std; result has mean ≈ 0, std ≈ 1 |
| `"minmax"` | MinMaxScaler: scale to [0, 1] range |
| `"none"` | No scaling applied |

**SMOTE Behavior**:
- Applied only if `apply_smote: true` AND minority class fraction < 30% in training set
- If minority class is small, `k_neighbors` is automatically reduced to `min(5, minority_count - 1)`
- If SMOTE fails (e.g., insufficient samples), preparation continues without SMOTE

**Pipeline Steps** (executed in order):
1. Subset to selected feature + target columns
2. Record before-statistics for numeric features
3. Handle missing values per `missing_strategy`
4. Label-encode the target column
5. One-hot encode categorical feature columns
6. Stratified train/test split (fallback to random if stratification fails)
7. Apply normalisation to training set; transform test set with fitted scaler
8. Apply SMOTE to training set (if enabled and imbalanced)
9. Record after-statistics
10. Store `X_train`, `X_test`, `y_train`, `y_test` on session; advance session to Step 4

**Response Schema** (`PreparationResult`):

```json
{
  "session_id": "string",
  "train_rows": "integer",
  "test_rows": "integer",
  "feature_count": "integer",
  "rows_removed": "integer",
  "missing_before": "integer",
  "missing_after": "integer",
  "normalisation": {
    "method": "string",
    "columns_normalised": ["string"],
    "sample_before": {"column_name": "number"},
    "sample_after": {"column_name": "number"}
  },
  "smote": {
    "applied": "boolean",
    "before_distribution": {"class_label": "integer"},
    "after_distribution": {"class_label": "integer"},
    "synthetic_samples": "integer"
  },
  "before_after_stats": [
    {
      "column": "string",
      "before": {
        "column": "string",
        "min": "number",
        "max": "number",
        "mean": "number",
        "std": "number",
        "missing": "integer"
      },
      "after": {
        "column": "string",
        "min": "number",
        "max": "number",
        "mean": "number",
        "std": "number",
        "missing": "integer"
      }
    }
  ],
  "data_ready": "boolean",
  "success_message": "string"
}
```

**Example Request**:

```bash
curl -X POST "http://localhost:8000/api/data/prepare" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "a3f2b1c4-8d9e-4f1a-b2c3-d4e5f6a7b8c9",
    "test_size": 0.2,
    "missing_strategy": "median",
    "normalisation": "zscore",
    "apply_smote": false
  }'
```

**Example Response** (HTTP 200):

```json
{
  "session_id": "a3f2b1c4-8d9e-4f1a-b2c3-d4e5f6a7b8c9",
  "train_rows": 242,
  "test_rows": 61,
  "feature_count": 13,
  "rows_removed": 0,
  "missing_before": 0,
  "missing_after": 0,
  "normalisation": {
    "method": "zscore",
    "columns_normalised": ["age", "trestbps", "chol", "thalach", "oldpeak"],
    "sample_before": {"age": 63.0, "trestbps": 145.0, "chol": 233.0, "thalach": 150.0, "oldpeak": 2.3},
    "sample_after": {"age": 0.952, "trestbps": 0.763, "chol": -0.256, "thalach": -0.009, "oldpeak": 1.087}
  },
  "smote": {
    "applied": false,
    "before_distribution": {"0": 111, "1": 131},
    "after_distribution": {"0": 111, "1": 131},
    "synthetic_samples": 0
  },
  "before_after_stats": [
    {
      "column": "age",
      "before": {"column": "age", "min": 29.0, "max": 77.0, "mean": 54.37, "std": 9.08, "missing": 0},
      "after": {"column": "age", "min": -2.786, "max": 2.490, "mean": 0.002, "std": 0.998, "missing": 0}
    }
  ],
  "data_ready": true,
  "success_message": "Data prepared successfully. 242 training samples, 61 test samples. 13 features after encoding. Features normalised using zscore."
}
```

**Error Responses**:

| Status | Condition | Example Detail |
|--------|-----------|---------------|
| 404 | Session not found | `"Session not found."` |
| 400 | No dataset loaded | `"No dataset loaded in this session."` |
| 400 | Column mapping not validated | `"Column mapping has not been validated. Please complete Step 2 column mapping first."` |
| 400 | No target column set | `"No target column set on this session."` |
| 422 | `test_size` out of range | Pydantic validation error |
| 422 | Invalid `missing_strategy` | Pydantic validation error |
| 422 | Invalid `normalisation` | Pydantic validation error |

---

### 10. Check Preparation Status

#### `GET /api/data/preparation-status`

Returns whether the session's dataset has been prepared and, if so, the resulting train/test split sizes.

**Tags**: Data Preparation

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session_id` | string | Yes | Active session ID |

**Response Schema** (`PreparationStatusResponse`):

```json
{
  "session_id": "string",
  "is_prepared": "boolean",
  "train_rows": "integer | null",
  "test_rows": "integer | null"
}
```

`train_rows` and `test_rows` are `null` when `is_prepared` is `false`.

**Example Request**:

```bash
curl "http://localhost:8000/api/data/preparation-status?session_id=a3f2b1c4-8d9e-4f1a-b2c3-d4e5f6a7b8c9"
```

**Example Response — Not Yet Prepared** (HTTP 200):

```json
{
  "session_id": "a3f2b1c4-8d9e-4f1a-b2c3-d4e5f6a7b8c9",
  "is_prepared": false,
  "train_rows": null,
  "test_rows": null
}
```

**Example Response — Prepared** (HTTP 200):

```json
{
  "session_id": "a3f2b1c4-8d9e-4f1a-b2c3-d4e5f6a7b8c9",
  "is_prepared": true,
  "train_rows": 242,
  "test_rows": 61
}
```

**Error Responses**:

| Status | Condition | Example Detail |
|--------|-----------|---------------|
| 404 | Session not found | `"Session not found."` |

---

## Session Lifecycle

Sessions are created by `POST /api/data/upload` or `POST /api/data/builtin` and are stored in-memory on the server.

| Property | Value |
|----------|-------|
| Session TTL | 60 minutes from last access |
| Session Storage | In-memory dictionary (not persisted across restarts) |
| Session Cleanup | On server startup; expired sessions cleaned automatically |
| Session ID Format | UUID v4 string |

**State Machine**:

```
[Created] → [Data Loaded] → [Column Mapping Validated] → [Prepared] → [Step 4 Ready]
              (POST /upload     (POST /column-mapping          (POST /prepare
               or /builtin)      schema_ok=true)                data_ready=true)
```

Step 3 (`POST /api/data/prepare`) is only accessible after the `[Column Mapping Validated]` state. Attempting to call it earlier returns HTTP 400.

---

## Domain IDs Reference

The following domain IDs are valid for `GET /api/domains/{domain_id}`, `POST /api/data/builtin`, and `POST /api/data/upload?domain_id=`:

| Domain ID | Name |
|-----------|------|
| `cardiology` | Heart Disease |
| `radiology` | Chest X-Ray (Pneumonia) |
| `nephrology` | Chronic Kidney Disease |
| `oncology-breast` | Breast Cancer |
| `neurology` | Parkinson's Disease |
| `endocrinology` | Diabetes |
| `hepatology` | Liver Disease |
| `stroke` | Stroke Prediction |
| `mental-health` | Mental Health (Depression) |
| `pulmonology` | COPD Risk |
| `haematology` | Anaemia Detection |
| `dermatology` | Skin Condition |
| `ophthalmology` | Diabetic Retinopathy |
| `orthopaedics` | Spine Condition |
| `icu-sepsis` | Sepsis Prediction |
| `obstetrics` | Fetal Health |
| `arrhythmia` | Cardiac Arrhythmia |
| `oncology-cervical` | Cervical Cancer |
| `thyroid` | Thyroid Disorder |
| `pharmacy` | Hospital Readmission |
