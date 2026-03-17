"""CSV validation utilities for file uploads."""

from __future__ import annotations

import re

from app.utils.constants import ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES


def validate_file_extension(filename: str) -> bool:
    """Return True if *filename* ends with an allowed extension (.csv)."""
    if not filename:
        return False
    lower = filename.lower().strip()
    return any(lower.endswith(ext) for ext in ALLOWED_EXTENSIONS)


def validate_file_size(file_size: int) -> bool:
    """Return True if *file_size* (bytes) does not exceed the upload limit."""
    return 0 < file_size <= MAX_FILE_SIZE_BYTES


def sanitize_column_name(name: str) -> str:
    """Clean a column name for safe downstream usage.

    - Strips leading/trailing whitespace
    - Replaces non-alphanumeric characters (except underscores) with underscores
    - Collapses consecutive underscores
    - Converts to lowercase
    - Strips leading/trailing underscores from the result
    """
    cleaned = name.strip()
    cleaned = re.sub(r"[^a-zA-Z0-9_]", "_", cleaned)
    cleaned = re.sub(r"_+", "_", cleaned)
    cleaned = cleaned.lower().strip("_")
    return cleaned if cleaned else "unnamed_column"
