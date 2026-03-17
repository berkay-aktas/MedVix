"""Application-wide constants for MedVix backend."""

# File upload limits
MAX_FILE_SIZE_MB = 50
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_EXTENSIONS = {".csv"}

# Data validation
MIN_ROWS = 10
MIN_NUMERIC_COLUMNS = 1

# Missing value thresholds (for color-coded action tags)
MISSING_GREEN_THRESHOLD = 0.05   # < 5% → green "OK"
MISSING_AMBER_THRESHOLD = 0.30   # 5-30% → amber "Some Missing"
# > 30% → red "High Missing"

# Class imbalance
IMBALANCE_THRESHOLD = 0.30  # minority class < 30% triggers warning

# Train/test split
DEFAULT_TEST_SIZE = 0.20
MIN_TEST_SIZE = 0.10
MAX_TEST_SIZE = 0.40

# Session management
SESSION_MAX_AGE_MINUTES = 60

# Column type detection
CATEGORICAL_MAX_UNIQUE = 20  # object columns with <= 20 unique → categorical
HIGH_CARDINALITY_THRESHOLD = 50  # > 50 unique values → high cardinality warning

# Data quality score weights
QUALITY_COMPLETENESS_WEIGHT = 40
QUALITY_DUPLICATES_WEIGHT = 20
QUALITY_CONSTANT_COLS_WEIGHT = 15
QUALITY_CARDINALITY_WEIGHT = 15
QUALITY_BALANCE_WEIGHT = 10
