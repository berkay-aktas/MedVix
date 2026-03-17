"""Tests for Step 2 — Data Exploration.

Covers:
  - POST /api/data/upload
  - POST /api/data/builtin
  - GET  /api/data/summary
  - POST /api/data/column-mapping
  - GET  /api/data/preview
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from tests.conftest import (
    ALL_DOMAIN_IDS,
    create_builtin_session,
    make_empty_csv,
    make_no_numeric_csv,
    make_too_few_rows_csv,
    make_valid_csv,
)


class TestCSVUpload:
    """POST /api/data/upload — file validation and session creation."""

    def test_upload_valid_csv(self, client: TestClient) -> None:
        """A well-formed CSV file returns 200 and a session_id."""
        csv_bytes = make_valid_csv(rows=50)
        resp = client.post(
            "/api/data/upload",
            params={"domain_id": "cardiology"},
            files={"file": ("heart_data.csv", csv_bytes, "text/csv")},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert "session_id" in body
        assert body["session_id"] != ""
        assert body["row_count"] == 50

    def test_upload_returns_column_count(self, client: TestClient) -> None:
        """The upload response reports the correct number of columns."""
        csv_bytes = make_valid_csv(rows=30)
        resp = client.post(
            "/api/data/upload",
            params={"domain_id": "cardiology"},
            files={"file": ("test.csv", csv_bytes, "text/csv")},
        )
        assert resp.status_code == 200
        # CSV has 14 columns (13 features + 1 target)
        assert resp.json()["column_count"] == 14

    def test_upload_non_csv(self, client: TestClient) -> None:
        """An xlsx file extension is rejected with 400 or 422."""
        csv_bytes = make_valid_csv(rows=50)
        resp = client.post(
            "/api/data/upload",
            params={"domain_id": "cardiology"},
            files={"file": ("data.xlsx", csv_bytes, "application/vnd.ms-excel")},
        )
        assert resp.status_code in {400, 422}

    def test_upload_empty_file(self, client: TestClient) -> None:
        """An empty CSV (header only, no rows) is rejected with 400 or 422."""
        resp = client.post(
            "/api/data/upload",
            params={"domain_id": "cardiology"},
            files={"file": ("empty.csv", make_empty_csv(), "text/csv")},
        )
        assert resp.status_code in {400, 422}

    def test_upload_too_few_rows(self, client: TestClient) -> None:
        """A CSV with fewer than MIN_ROWS (10) rows is rejected."""
        resp = client.post(
            "/api/data/upload",
            params={"domain_id": "cardiology"},
            files={
                "file": ("tiny.csv", make_too_few_rows_csv(rows=5), "text/csv")
            },
        )
        assert resp.status_code in {400, 422}

    def test_upload_no_numeric_columns(self, client: TestClient) -> None:
        """A CSV with no numeric columns is rejected with 400 or 422."""
        resp = client.post(
            "/api/data/upload",
            params={"domain_id": "cardiology"},
            files={
                "file": (
                    "text_only.csv",
                    make_no_numeric_csv(rows=20),
                    "text/csv",
                )
            },
        )
        assert resp.status_code in {400, 422}

    def test_upload_unknown_domain(self, client: TestClient) -> None:
        """Uploading with an unknown domain_id returns 400."""
        resp = client.post(
            "/api/data/upload",
            params={"domain_id": "unknown-domain-xyz"},
            files={"file": ("data.csv", make_valid_csv(50), "text/csv")},
        )
        assert resp.status_code == 400


class TestBuiltinDataset:
    """POST /api/data/builtin — built-in dataset loading."""

    def test_load_cardiology(self, client: TestClient) -> None:
        """Loading the cardiology dataset returns 200 and row_count > 0."""
        resp = client.post(
            "/api/data/builtin", json={"domain_id": "cardiology"}
        )
        assert resp.status_code == 200
        body = resp.json()
        assert "session_id" in body
        assert body["row_count"] > 0

    def test_load_cardiology_has_13_features(self, client: TestClient) -> None:
        """The cardiology dataset CSV has 14 columns (13 features + target)."""
        resp = client.post(
            "/api/data/builtin", json={"domain_id": "cardiology"}
        )
        assert resp.status_code == 200
        assert resp.json()["column_count"] == 14

    @pytest.mark.parametrize("domain_id", ALL_DOMAIN_IDS)
    def test_load_all_20_domains(
        self, client: TestClient, domain_id: str
    ) -> None:
        """Every one of the 20 built-in datasets loads without error."""
        resp = client.post(
            "/api/data/builtin", json={"domain_id": domain_id}
        )
        assert resp.status_code == 200, (
            f"Domain '{domain_id}' failed to load: {resp.text}"
        )
        body = resp.json()
        assert body["row_count"] > 0, (
            f"Domain '{domain_id}' loaded 0 rows"
        )

    def test_load_nonexistent_domain(self, client: TestClient) -> None:
        """A non-existent domain_id returns 400 (unknown domain check)."""
        resp = client.post(
            "/api/data/builtin", json={"domain_id": "does-not-exist"}
        )
        assert resp.status_code in {400, 404}

    def test_builtin_response_has_filename(self, client: TestClient) -> None:
        """The builtin response includes a filename field."""
        resp = client.post(
            "/api/data/builtin", json={"domain_id": "cardiology"}
        )
        assert resp.status_code == 200
        assert "filename" in resp.json()
        assert resp.json()["filename"].endswith(".csv")


class TestDataSummary:
    """GET /api/data/summary — per-column statistics and quality scoring."""

    def test_summary_has_columns(self, client: TestClient) -> None:
        """The summary response includes a list of ColumnInfo objects."""
        session_id = create_builtin_session(client)
        resp = client.get(f"/api/data/summary?session_id={session_id}")
        assert resp.status_code == 200
        body = resp.json()
        assert "columns" in body
        assert len(body["columns"]) > 0

    def test_summary_column_fields(self, client: TestClient) -> None:
        """Each column entry has the required statistical fields."""
        session_id = create_builtin_session(client)
        resp = client.get(f"/api/data/summary?session_id={session_id}")
        assert resp.status_code == 200
        required = {"name", "dtype", "missing_pct", "action_tag"}
        for col in resp.json()["columns"]:
            missing = required - set(col.keys())
            assert not missing, f"Column '{col['name']}' is missing fields: {missing}"

    def test_summary_class_distribution(self, client: TestClient) -> None:
        """class_distribution is a non-empty list for a loaded dataset."""
        session_id = create_builtin_session(client)
        resp = client.get(f"/api/data/summary?session_id={session_id}")
        assert resp.status_code == 200
        dist = resp.json()["class_distribution"]
        assert isinstance(dist, list)
        assert len(dist) > 0

    def test_summary_quality_score_in_range(self, client: TestClient) -> None:
        """data_quality_score is an integer between 0 and 100 (inclusive)."""
        session_id = create_builtin_session(client)
        resp = client.get(f"/api/data/summary?session_id={session_id}")
        assert resp.status_code == 200
        score = resp.json()["data_quality_score"]
        assert isinstance(score, int)
        assert 0 <= score <= 100

    def test_summary_action_tags_valid(self, client: TestClient) -> None:
        """Every column's action_tag is one of the three allowed values."""
        session_id = create_builtin_session(client)
        resp = client.get(f"/api/data/summary?session_id={session_id}")
        assert resp.status_code == 200
        allowed = {"OK", "Some Missing", "High Missing"}
        for col in resp.json()["columns"]:
            assert col["action_tag"] in allowed, (
                f"Column '{col['name']}' has unexpected action_tag "
                f"'{col['action_tag']}'"
            )

    def test_summary_row_count_positive(self, client: TestClient) -> None:
        """The summary row_count is greater than zero."""
        session_id = create_builtin_session(client)
        resp = client.get(f"/api/data/summary?session_id={session_id}")
        assert resp.status_code == 200
        assert resp.json()["row_count"] > 0

    def test_summary_missing_pct_in_range(self, client: TestClient) -> None:
        """Every column's missing_pct is between 0.0 and 100.0."""
        session_id = create_builtin_session(client)
        resp = client.get(f"/api/data/summary?session_id={session_id}")
        assert resp.status_code == 200
        for col in resp.json()["columns"]:
            assert 0.0 <= col["missing_pct"] <= 100.0, (
                f"missing_pct out of range for column '{col['name']}'"
            )

    def test_missing_session_id(self, client: TestClient) -> None:
        """Requesting summary without a session_id returns an error status."""
        resp = client.get("/api/data/summary?session_id=nonexistent-id-xyz")
        assert resp.status_code in {400, 404, 422}

    def test_summary_session_id_field(self, client: TestClient) -> None:
        """The summary response echoes the session_id."""
        session_id = create_builtin_session(client)
        resp = client.get(f"/api/data/summary?session_id={session_id}")
        assert resp.status_code == 200
        assert resp.json()["session_id"] == session_id


class TestColumnMapper:
    """POST /api/data/column-mapping — column role assignment and validation."""

    def _build_mapping_payload(
        self, client: TestClient, session_id: str
    ) -> dict:
        """Build a valid column-mapping payload for the given session."""
        summary = client.get(
            f"/api/data/summary?session_id={session_id}"
        ).json()
        target_col = summary["target_column"]
        mappings = []
        for col in summary["columns"]:
            role = "target" if col["name"] == target_col else "feature"
            mappings.append({"csv_column": col["name"], "role": role})
        return {
            "session_id": session_id,
            "target_column": target_col,
            "mappings": mappings,
        }

    def test_valid_mapping(self, client: TestClient) -> None:
        """A well-formed column-mapping request returns 200."""
        session_id = create_builtin_session(client)
        payload = self._build_mapping_payload(client, session_id)
        resp = client.post("/api/data/column-mapping", json=payload)
        assert resp.status_code == 200

    def test_mapping_sets_schema_ok(self, client: TestClient) -> None:
        """A valid mapping sets schema_ok to True in the response."""
        session_id = create_builtin_session(client)
        payload = self._build_mapping_payload(client, session_id)
        resp = client.post("/api/data/column-mapping", json=payload)
        assert resp.status_code == 200
        assert resp.json()["schema_ok"] is True

    def test_mapping_response_has_feature_count(
        self, client: TestClient
    ) -> None:
        """The mapping response includes feature_count > 0."""
        session_id = create_builtin_session(client)
        payload = self._build_mapping_payload(client, session_id)
        resp = client.post("/api/data/column-mapping", json=payload)
        assert resp.status_code == 200
        assert resp.json()["feature_count"] > 0

    def test_mapping_nonexistent_target(self, client: TestClient) -> None:
        """Specifying a target column that does not exist sets schema_ok=False."""
        session_id = create_builtin_session(client)
        summary = client.get(
            f"/api/data/summary?session_id={session_id}"
        ).json()
        mappings = [
            {"csv_column": col["name"], "role": "feature"}
            for col in summary["columns"]
        ]
        payload = {
            "session_id": session_id,
            "target_column": "column_that_does_not_exist",
            "mappings": mappings,
        }
        resp = client.post("/api/data/column-mapping", json=payload)
        assert resp.status_code == 200
        assert resp.json()["schema_ok"] is False

    def test_mapping_unknown_session(self, client: TestClient) -> None:
        """Posting a mapping for an unknown session returns 404."""
        payload = {
            "session_id": "00000000-fake-fake-fake-000000000000",
            "target_column": "target",
            "mappings": [{"csv_column": "age", "role": "feature"}],
        }
        resp = client.post("/api/data/column-mapping", json=payload)
        assert resp.status_code == 404

    def test_mapping_echoes_session_id(self, client: TestClient) -> None:
        """The mapping response echoes the session_id."""
        session_id = create_builtin_session(client)
        payload = self._build_mapping_payload(client, session_id)
        resp = client.post("/api/data/column-mapping", json=payload)
        assert resp.status_code == 200
        assert resp.json()["session_id"] == session_id


class TestDataPreview:
    """GET /api/data/preview — first-N-rows preview endpoint."""

    def test_preview_default_rows(self, client: TestClient) -> None:
        """The default preview returns up to 5 rows."""
        session_id = create_builtin_session(client)
        resp = client.get(f"/api/data/preview?session_id={session_id}")
        assert resp.status_code == 200
        body = resp.json()
        assert len(body["rows"]) <= 5

    def test_preview_custom_row_count(self, client: TestClient) -> None:
        """The preview honours the ?rows= query parameter."""
        session_id = create_builtin_session(client)
        resp = client.get(
            f"/api/data/preview?session_id={session_id}&rows=10"
        )
        assert resp.status_code == 200
        assert len(resp.json()["rows"]) <= 10

    def test_preview_columns_present(self, client: TestClient) -> None:
        """The preview body contains a non-empty columns list."""
        session_id = create_builtin_session(client)
        resp = client.get(f"/api/data/preview?session_id={session_id}")
        assert resp.status_code == 200
        assert len(resp.json()["columns"]) > 0

    def test_preview_total_rows_positive(self, client: TestClient) -> None:
        """total_rows in the preview reflects the full dataset size."""
        session_id = create_builtin_session(client)
        resp = client.get(f"/api/data/preview?session_id={session_id}")
        assert resp.status_code == 200
        assert resp.json()["total_rows"] > 0

    def test_preview_unknown_session(self, client: TestClient) -> None:
        """Preview with an unknown session_id returns 404."""
        resp = client.get(
            "/api/data/preview?session_id=00000000-fake-fake-fake-000000000000"
        )
        assert resp.status_code == 404
