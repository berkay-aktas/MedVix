"""Session state dataclass for in-memory pipeline state management."""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd


@dataclass
class SessionState:
    """Holds all mutable state for a single user pipeline session.

    This is intentionally *not* a Pydantic model because it stores
    non-serialisable objects (DataFrames, numpy arrays) that live
    only in server memory.
    """

    session_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    domain_id: str = ""
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    # Step 2 — Data Exploration
    df: Optional[pd.DataFrame] = field(default=None, repr=False)
    target_column: Optional[str] = None
    feature_columns: Optional[List[str]] = None
    column_mapping: Optional[Dict[str, str]] = None
    schema_ok: bool = False

    # Step 3 — Data Preparation
    preparation_config: Optional[Dict[str, Any]] = None
    X_train: Optional[np.ndarray] = field(default=None, repr=False)
    X_test: Optional[np.ndarray] = field(default=None, repr=False)
    y_train: Optional[np.ndarray] = field(default=None, repr=False)
    y_test: Optional[np.ndarray] = field(default=None, repr=False)
    is_prepared: bool = False

    # Navigation
    current_step: int = 1
