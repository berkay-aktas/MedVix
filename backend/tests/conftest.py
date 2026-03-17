"""Shared fixtures and helpers for the MedVix backend test suite."""

from __future__ import annotations

import io
import json
from typing import Optional

import pytest
from fastapi.testclient import TestClient

from app.main import app

# ---------------------------------------------------------------------------
# Domain IDs
# ---------------------------------------------------------------------------

ALL_DOMAIN_IDS = [
    "cardiology",
    "radiology",
    "nephrology",
    "oncology-breast",
    "neurology",
    "endocrinology",
    "hepatology",
    "cardiology-stroke",
    "mental-health",
    "pulmonology",
    "haematology",
    "dermatology",
    "ophthalmology",
    "orthopaedics",
    "icu-sepsis",
    "obstetrics",
    "cardiology-arrhythmia",
    "oncology-cervical",
    "thyroid",
    "pharmacy",
]

# ---------------------------------------------------------------------------
# TestClient fixture
# ---------------------------------------------------------------------------


@pytest.fixture(scope="session")
def client() -> TestClient:
    """Session-scoped FastAPI TestClient — spun up once per test run."""
    with TestClient(app) as tc:
        yield tc


# ---------------------------------------------------------------------------
# CSV content helpers
# ---------------------------------------------------------------------------


def make_valid_csv(rows: int = 50) -> bytes:
    """Return bytes for a valid cardiology-shaped CSV.

    Columns: age, sex, cp, trestbps, chol, fbs, restecg,
             thalach, exang, oldpeak, slope, ca, thal, target
    """
    buf = io.StringIO()
    buf.write("age,sex,cp,trestbps,chol,fbs,restecg,thalach,exang,oldpeak,slope,ca,thal,target\n")
    for i in range(rows):
        age = 40 + (i % 40)
        sex = i % 2
        cp = i % 4
        trestbps = 120 + (i % 40)
        chol = 200 + (i % 100)
        fbs = i % 2
        restecg = i % 3
        thalach = 140 + (i % 60)
        exang = i % 2
        oldpeak = round((i % 30) / 10.0, 1)
        slope = i % 3
        ca = i % 4
        thal = 1 + (i % 3)
        target = i % 2
        buf.write(
            f"{age},{sex},{cp},{trestbps},{chol},{fbs},{restecg},"
            f"{thalach},{exang},{oldpeak},{slope},{ca},{thal},{target}\n"
        )
    return buf.getvalue().encode("utf-8")


def make_empty_csv() -> bytes:
    """Return a CSV that contains only a header row (no data)."""
    return b"age,sex,target\n"


def make_too_few_rows_csv(rows: int = 5) -> bytes:
    """Return a valid-shaped CSV with fewer rows than MIN_ROWS (10)."""
    buf = io.StringIO()
    buf.write("age,sex,target\n")
    for i in range(rows):
        buf.write(f"{30 + i},{i % 2},{i % 2}\n")
    return buf.getvalue().encode("utf-8")


def make_no_numeric_csv(rows: int = 20) -> bytes:
    """Return a CSV whose every column contains only text values."""
    buf = io.StringIO()
    buf.write("name,city,status\n")
    for i in range(rows):
        buf.write(f"patient_{i},city_{i % 5},ok\n")
    return buf.getvalue().encode("utf-8")


# ---------------------------------------------------------------------------
# Session-bootstrapping helpers
# ---------------------------------------------------------------------------


def create_builtin_session(client: TestClient, domain_id: str = "cardiology") -> str:
    """Load the built-in dataset for *domain_id* and return the session_id."""
    resp = client.post("/api/data/builtin", json={"domain_id": domain_id})
    assert resp.status_code == 200, f"builtin load failed: {resp.text}"
    return resp.json()["session_id"]


def create_mapped_session(client: TestClient, domain_id: str = "cardiology") -> str:
    """Load built-in data, validate column mapping, and return session_id.

    After this call the session has ``schema_ok=True`` and is ready for
    the preparation step.
    """
    session_id = create_builtin_session(client, domain_id)

    # Build a mapping with all columns marked as feature except 'target'
    summary_resp = client.get(f"/api/data/summary?session_id={session_id}")
    assert summary_resp.status_code == 200
    summary = summary_resp.json()

    target_col = summary["target_column"]
    mappings = []
    for col_info in summary["columns"]:
        col_name = col_info["name"]
        if col_name == target_col:
            mappings.append({"csv_column": col_name, "role": "target"})
        else:
            mappings.append({"csv_column": col_name, "role": "feature"})

    mapping_resp = client.post(
        "/api/data/column-mapping",
        json={
            "session_id": session_id,
            "target_column": target_col,
            "mappings": mappings,
        },
    )
    assert mapping_resp.status_code == 200
    assert mapping_resp.json()["schema_ok"] is True
    return session_id


def create_prepared_session(
    client: TestClient,
    domain_id: str = "cardiology",
    missing_strategy: str = "median",
    normalisation: str = "zscore",
    test_size: float = 0.2,
    apply_smote: bool = False,
) -> str:
    """Load built-in data, map columns, run preparation, and return session_id."""
    session_id = create_mapped_session(client, domain_id)
    prep_resp = client.post(
        "/api/data/prepare",
        json={
            "session_id": session_id,
            "missing_strategy": missing_strategy,
            "normalisation": normalisation,
            "test_size": test_size,
            "apply_smote": apply_smote,
        },
    )
    assert prep_resp.status_code == 200, f"prepare failed: {prep_resp.text}"
    return session_id
