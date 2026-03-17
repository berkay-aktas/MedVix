"""Tests for Step 3 — Data Preparation.

Covers:
  - POST /api/data/prepare
  - GET  /api/data/preparation-status
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from tests.conftest import (
    create_builtin_session,
    create_mapped_session,
    create_prepared_session,
)


class TestPreparation:
    """POST /api/data/prepare — full preparation pipeline."""

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _prepare(
        self,
        client: TestClient,
        session_id: str,
        *,
        missing_strategy: str = "median",
        normalisation: str = "zscore",
        test_size: float = 0.2,
        apply_smote: bool = False,
    ) -> dict:
        """Call /api/data/prepare and return the parsed JSON body."""
        resp = client.post(
            "/api/data/prepare",
            json={
                "session_id": session_id,
                "missing_strategy": missing_strategy,
                "normalisation": normalisation,
                "test_size": test_size,
                "apply_smote": apply_smote,
            },
        )
        return resp

    # ------------------------------------------------------------------
    # Basic success cases
    # ------------------------------------------------------------------

    def test_prepare_median_zscore(self, client: TestClient) -> None:
        """median + zscore preparation returns 200 and data_ready=True."""
        session_id = create_mapped_session(client)
        resp = self._prepare(
            client, session_id, missing_strategy="median", normalisation="zscore"
        )
        assert resp.status_code == 200
        assert resp.json()["data_ready"] is True

    def test_prepare_mode_minmax(self, client: TestClient) -> None:
        """mode + minmax preparation returns 200 and data_ready=True."""
        session_id = create_mapped_session(client)
        resp = self._prepare(
            client, session_id, missing_strategy="mode", normalisation="minmax"
        )
        assert resp.status_code == 200
        assert resp.json()["data_ready"] is True

    def test_prepare_remove_none(self, client: TestClient) -> None:
        """remove + none preparation returns 200 and data_ready=True."""
        session_id = create_mapped_session(client)
        resp = self._prepare(
            client, session_id, missing_strategy="remove", normalisation="none"
        )
        assert resp.status_code == 200
        assert resp.json()["data_ready"] is True

    def test_prepare_with_smote(self, client: TestClient) -> None:
        """Enabling apply_smote=True completes without error."""
        session_id = create_mapped_session(client)
        resp = self._prepare(client, session_id, apply_smote=True)
        assert resp.status_code == 200
        assert resp.json()["data_ready"] is True

    # ------------------------------------------------------------------
    # Row / feature counts
    # ------------------------------------------------------------------

    def test_prepare_returns_train_test_counts(
        self, client: TestClient
    ) -> None:
        """train_rows + test_rows is positive after preparation."""
        session_id = create_mapped_session(client)
        resp = self._prepare(client, session_id)
        assert resp.status_code == 200
        body = resp.json()
        assert body["train_rows"] > 0
        assert body["test_rows"] > 0
        assert body["train_rows"] + body["test_rows"] > 0

    def test_prepare_feature_count_positive(self, client: TestClient) -> None:
        """feature_count in the response is greater than zero."""
        session_id = create_mapped_session(client)
        resp = self._prepare(client, session_id)
        assert resp.status_code == 200
        assert resp.json()["feature_count"] > 0

    # ------------------------------------------------------------------
    # Before/after stats
    # ------------------------------------------------------------------

    def test_prepare_returns_before_after_stats(
        self, client: TestClient
    ) -> None:
        """before_after_stats is a non-empty list."""
        session_id = create_mapped_session(client)
        resp = self._prepare(client, session_id)
        assert resp.status_code == 200
        stats = resp.json()["before_after_stats"]
        assert isinstance(stats, list)
        assert len(stats) > 0

    def test_prepare_before_after_stats_structure(
        self, client: TestClient
    ) -> None:
        """Each before_after entry has column, before, and after keys."""
        session_id = create_mapped_session(client)
        resp = self._prepare(client, session_id)
        assert resp.status_code == 200
        for entry in resp.json()["before_after_stats"]:
            assert "column" in entry
            assert "before" in entry
            assert "after" in entry

    # ------------------------------------------------------------------
    # Normalisation result
    # ------------------------------------------------------------------

    def test_prepare_normalisation_samples(self, client: TestClient) -> None:
        """The normalisation result has a 'method' field."""
        session_id = create_mapped_session(client)
        resp = self._prepare(
            client, session_id, normalisation="zscore"
        )
        assert resp.status_code == 200
        norm = resp.json()["normalisation"]
        assert "method" in norm
        assert norm["method"] == "zscore"

    def test_prepare_normalisation_method_minmax(
        self, client: TestClient
    ) -> None:
        """The normalisation result reflects the requested minmax method."""
        session_id = create_mapped_session(client)
        resp = self._prepare(
            client, session_id, normalisation="minmax"
        )
        assert resp.status_code == 200
        assert resp.json()["normalisation"]["method"] == "minmax"

    def test_prepare_normalisation_method_none(
        self, client: TestClient
    ) -> None:
        """Requesting normalisation='none' is reflected in the result."""
        session_id = create_mapped_session(client)
        resp = self._prepare(
            client, session_id, normalisation="none"
        )
        assert resp.status_code == 200
        assert resp.json()["normalisation"]["method"] == "none"

    # ------------------------------------------------------------------
    # SMOTE result
    # ------------------------------------------------------------------

    def test_prepare_smote_result_present(self, client: TestClient) -> None:
        """The response always includes a smote result object."""
        session_id = create_mapped_session(client)
        resp = self._prepare(client, session_id, apply_smote=False)
        assert resp.status_code == 200
        assert "smote" in resp.json()

    def test_prepare_smote_not_applied_when_false(
        self, client: TestClient
    ) -> None:
        """When apply_smote=False, smote.applied is False."""
        session_id = create_mapped_session(client)
        resp = self._prepare(client, session_id, apply_smote=False)
        assert resp.status_code == 200
        assert resp.json()["smote"]["applied"] is False

    # ------------------------------------------------------------------
    # Guard rails — schema not validated
    # ------------------------------------------------------------------

    def test_prepare_without_schema_ok(self, client: TestClient) -> None:
        """Calling prepare before column-mapping returns 400."""
        # Load data but skip column-mapping so schema_ok stays False
        session_id = create_builtin_session(client)
        resp = self._prepare(client, session_id)
        assert resp.status_code == 400

    def test_prepare_invalid_session(self, client: TestClient) -> None:
        """Calling prepare with a fake session_id returns 404."""
        resp = self._prepare(
            client, "00000000-fake-fake-fake-000000000000"
        )
        assert resp.status_code == 404

    # ------------------------------------------------------------------
    # Split ratios
    # ------------------------------------------------------------------

    @pytest.mark.parametrize("test_size", [0.1, 0.2, 0.3, 0.4])
    def test_split_ratios(
        self, client: TestClient, test_size: float
    ) -> None:
        """All allowed test_size values (0.1–0.4) complete successfully."""
        session_id = create_mapped_session(client)
        resp = self._prepare(client, session_id, test_size=test_size)
        assert resp.status_code == 200, (
            f"test_size={test_size} failed: {resp.text}"
        )
        body = resp.json()
        assert body["data_ready"] is True
        assert body["test_rows"] > 0

    @pytest.mark.parametrize("test_size", [0.1, 0.2, 0.3, 0.4])
    def test_split_ratio_proportions(
        self, client: TestClient, test_size: float
    ) -> None:
        """test_rows / (train_rows + test_rows) is approximately test_size."""
        session_id = create_mapped_session(client)
        resp = self._prepare(client, session_id, test_size=test_size)
        assert resp.status_code == 200
        body = resp.json()
        total = body["train_rows"] + body["test_rows"]
        actual_ratio = body["test_rows"] / total
        # Allow ±5% tolerance due to stratification rounding
        assert abs(actual_ratio - test_size) < 0.05, (
            f"Expected ~{test_size:.0%} test split, "
            f"got {actual_ratio:.2%} for test_size={test_size}"
        )

    # ------------------------------------------------------------------
    # Preparation status endpoint
    # ------------------------------------------------------------------

    def test_preparation_status_after_prepare(
        self, client: TestClient
    ) -> None:
        """GET /api/data/preparation-status returns is_prepared=True after prepare."""
        session_id = create_prepared_session(client)
        resp = client.get(
            f"/api/data/preparation-status?session_id={session_id}"
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["is_prepared"] is True

    def test_preparation_status_before_prepare(
        self, client: TestClient
    ) -> None:
        """GET /api/data/preparation-status returns is_prepared=False before prepare."""
        session_id = create_builtin_session(client)
        resp = client.get(
            f"/api/data/preparation-status?session_id={session_id}"
        )
        assert resp.status_code == 200
        assert resp.json()["is_prepared"] is False

    def test_preparation_status_has_train_test_counts(
        self, client: TestClient
    ) -> None:
        """After preparation, train_rows and test_rows are positive."""
        session_id = create_prepared_session(client)
        resp = client.get(
            f"/api/data/preparation-status?session_id={session_id}"
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["train_rows"] is not None and body["train_rows"] > 0
        assert body["test_rows"] is not None and body["test_rows"] > 0

    def test_preparation_status_unknown_session(
        self, client: TestClient
    ) -> None:
        """Requesting status with an unknown session_id returns 404."""
        resp = client.get(
            "/api/data/preparation-status"
            "?session_id=00000000-fake-fake-fake-000000000000"
        )
        assert resp.status_code == 404

    # ------------------------------------------------------------------
    # Success message
    # ------------------------------------------------------------------

    def test_prepare_has_success_message(self, client: TestClient) -> None:
        """The preparation response includes a non-empty success_message."""
        session_id = create_mapped_session(client)
        resp = self._prepare(client, session_id)
        assert resp.status_code == 200
        msg = resp.json().get("success_message", "")
        assert isinstance(msg, str) and msg.strip() != ""

    # ------------------------------------------------------------------
    # Session ID echoed
    # ------------------------------------------------------------------

    def test_prepare_echoes_session_id(self, client: TestClient) -> None:
        """The preparation result echoes the session_id."""
        session_id = create_mapped_session(client)
        resp = self._prepare(client, session_id)
        assert resp.status_code == 200
        assert resp.json()["session_id"] == session_id
