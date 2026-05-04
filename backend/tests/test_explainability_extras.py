"""Smoke tests for the counterfactual explorer and pipeline receipt endpoints.

These cover the new POST endpoints added in May 2026:
  POST /api/explainability/counterfactual
  POST /api/explainability/counterfactual/auto-find
  POST /api/ethics/generate-receipt
"""

from __future__ import annotations

import pytest

from tests.conftest import create_prepared_session


def _train_random_forest(client, session_id: str) -> str:
    """Train a Random Forest with default hyperparams; return model_id."""
    resp = client.post(
        "/api/ml/train",
        json={
            "session_id": session_id,
            "model_type": "random_forest",
            "hyperparams": {},
        },
    )
    assert resp.status_code == 200, f"train failed: {resp.text}"
    return resp.json()["model_id"]


# ---------------------------------------------------------------------------
# Counterfactual: baseline + overrides
# ---------------------------------------------------------------------------


class TestCounterfactual:
    """POST /api/explainability/counterfactual"""

    def test_baseline_returns_probability_and_ranges(self, client):
        session_id = create_prepared_session(client)
        model_id = _train_random_forest(client, session_id)
        resp = client.post(
            "/api/explainability/counterfactual",
            json={
                "session_id": session_id,
                "model_id": model_id,
                "patient_index": 0,
                "feature_overrides": None,
            },
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert 0.0 <= data["probability"] <= 1.0
        assert data["predicted_class"] in {"positive", "negative"} or isinstance(data["predicted_class"], str)
        assert "predicted_label" in data
        assert data["baseline_probability"] == data["probability"]  # no overrides → equal
        assert data["prediction_changed"] is False
        assert isinstance(data["feature_ranges"], list)
        assert len(data["feature_ranges"]) >= 1
        # Each range has the required slider/toggle metadata
        for fr in data["feature_ranges"]:
            assert {"feature_name", "display_name", "feature_type", "min_value", "max_value", "current_value"} <= fr.keys()
            assert fr["feature_type"] in {"binary", "continuous"}
            assert fr["max_value"] >= fr["min_value"]

    def test_empty_overrides_equivalent_to_none(self, client):
        session_id = create_prepared_session(client)
        model_id = _train_random_forest(client, session_id)
        resp = client.post(
            "/api/explainability/counterfactual",
            json={
                "session_id": session_id,
                "model_id": model_id,
                "patient_index": 0,
                "feature_overrides": {},
            },
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert data["probability"] == data["baseline_probability"]
        assert data["prediction_changed"] is False

    def test_override_changes_prediction_or_at_least_probability(self, client):
        """Applying a large override should alter the probability (even if class doesn't flip)."""
        session_id = create_prepared_session(client)
        model_id = _train_random_forest(client, session_id)

        # First fetch baseline + ranges
        baseline_resp = client.post(
            "/api/explainability/counterfactual",
            json={
                "session_id": session_id,
                "model_id": model_id,
                "patient_index": 0,
                "feature_overrides": None,
            },
        )
        baseline = baseline_resp.json()
        # Pick a continuous feature and push it to one extreme
        cont = next((f for f in baseline["feature_ranges"] if f["feature_type"] == "continuous"), None)
        assert cont is not None, "Cardiology should have at least one continuous feature"

        # Override to the opposite extreme of the slider range
        target = cont["min_value"] if cont["current_value"] >= (cont["min_value"] + cont["max_value"]) / 2 else cont["max_value"]
        override_resp = client.post(
            "/api/explainability/counterfactual",
            json={
                "session_id": session_id,
                "model_id": model_id,
                "patient_index": 0,
                "feature_overrides": {cont["feature_name"]: target},
            },
        )
        assert override_resp.status_code == 200
        new_data = override_resp.json()
        # Either the probability shifts measurably, or the class flipped
        delta = abs(new_data["probability"] - baseline["probability"])
        assert delta > 1e-4 or new_data["prediction_changed"], (
            f"Pushing {cont['feature_name']} to extreme had no effect (delta={delta})"
        )

    def test_invalid_patient_index_returns_400(self, client):
        session_id = create_prepared_session(client)
        model_id = _train_random_forest(client, session_id)
        resp = client.post(
            "/api/explainability/counterfactual",
            json={
                "session_id": session_id,
                "model_id": model_id,
                "patient_index": 99999,
                "feature_overrides": None,
            },
        )
        assert resp.status_code == 400

    def test_unknown_model_returns_400(self, client):
        session_id = create_prepared_session(client)
        _train_random_forest(client, session_id)
        resp = client.post(
            "/api/explainability/counterfactual",
            json={
                "session_id": session_id,
                "model_id": "does-not-exist",
                "patient_index": 0,
                "feature_overrides": None,
            },
        )
        assert resp.status_code == 400

    def test_unknown_session_returns_404(self, client):
        resp = client.post(
            "/api/explainability/counterfactual",
            json={
                "session_id": "no-such-session",
                "model_id": "any",
                "patient_index": 0,
                "feature_overrides": None,
            },
        )
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Counterfactual auto-find
# ---------------------------------------------------------------------------


class TestAutoFind:
    """POST /api/explainability/counterfactual/auto-find"""

    def test_returns_valid_response_shape(self, client):
        session_id = create_prepared_session(client)
        model_id = _train_random_forest(client, session_id)
        resp = client.post(
            "/api/explainability/counterfactual/auto-find",
            json={
                "session_id": session_id,
                "model_id": model_id,
                "patient_index": 0,
            },
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert "success" in data and isinstance(data["success"], bool)
        assert "explanation" in data and isinstance(data["explanation"], str)
        assert 0.0 <= data["baseline_probability"] <= 1.0
        # If success, suggested fields populated; otherwise they're null
        if data["success"]:
            assert data["feature_name"] is not None
            assert data["suggested_value"] is not None
            assert data["new_class"] != data["baseline_class"]

    def test_invalid_patient_index_returns_400(self, client):
        session_id = create_prepared_session(client)
        model_id = _train_random_forest(client, session_id)
        resp = client.post(
            "/api/explainability/counterfactual/auto-find",
            json={
                "session_id": session_id,
                "model_id": model_id,
                "patient_index": -1,
            },
        )
        assert resp.status_code == 400


# ---------------------------------------------------------------------------
# Receipt
# ---------------------------------------------------------------------------


class TestReceipt:
    """POST /api/ethics/generate-receipt"""

    def test_returns_prose_paragraph(self, client):
        session_id = create_prepared_session(client, apply_smote=True)
        model_id = _train_random_forest(client, session_id)
        resp = client.post(
            "/api/ethics/generate-receipt",
            json={
                "session_id": session_id,
                "model_id": model_id,
                "checklist_status": {f"item{i}": (i < 6) for i in range(8)},
            },
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert isinstance(data["receipt"], str)
        assert len(data["receipt"]) > 50, "Receipt is too short to be meaningful"
        assert "MedVix trained" in data["receipt"]
        # Preparation phrasing should reflect SMOTE
        assert "SMOTE" in data["receipt"]
        # Checklist sentence should appear
        assert "EU AI Act" in data["receipt"]
        assert "6 of 8" in data["receipt"]
        assert data["domain_id"] == "cardiology"
        assert data["model_id"] == model_id

    def test_unknown_session_returns_404(self, client):
        resp = client.post(
            "/api/ethics/generate-receipt",
            json={
                "session_id": "no-such-session",
                "model_id": "any",
                "checklist_status": {},
            },
        )
        assert resp.status_code == 404

    def test_unknown_model_returns_400(self, client):
        session_id = create_prepared_session(client)
        resp = client.post(
            "/api/ethics/generate-receipt",
            json={
                "session_id": session_id,
                "model_id": "does-not-exist",
                "checklist_status": {},
            },
        )
        assert resp.status_code == 400
