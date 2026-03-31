"""Tests for Step 5 — Results & Evaluation.

Covers:
  GET  /api/ml/models?session_id=X
  POST /api/ml/compare
"""

import pytest
from tests.conftest import create_prepared_session


def _train_model(client, session_id, model_type="knn"):
    """Helper to train a model and return the response data."""
    resp = client.post("/api/ml/train", json={
        "session_id": session_id,
        "model_type": model_type,
        "hyperparams": {}
    })
    assert resp.status_code == 200
    return resp.json()


class TestListModels:
    """GET /api/ml/models"""

    def test_empty_session_returns_empty(self, client):
        session_id = create_prepared_session(client)
        resp = client.get(f"/api/ml/models?session_id={session_id}")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_one_model_after_training(self, client):
        session_id = create_prepared_session(client)
        _train_model(client, session_id, "knn")
        resp = client.get(f"/api/ml/models?session_id={session_id}")
        assert resp.status_code == 200
        models = resp.json()
        assert len(models) == 1
        assert models[0]["model_type"] == "knn"

    def test_three_models_after_training(self, client):
        session_id = create_prepared_session(client)
        for m in ["knn", "decision_tree", "logistic_regression"]:
            _train_model(client, session_id, m)
        resp = client.get(f"/api/ml/models?session_id={session_id}")
        models = resp.json()
        assert len(models) == 3
        types = [m["model_type"] for m in models]
        assert "knn" in types
        assert "decision_tree" in types
        assert "logistic_regression" in types

    def test_model_summary_fields(self, client):
        session_id = create_prepared_session(client)
        _train_model(client, session_id, "random_forest")
        resp = client.get(f"/api/ml/models?session_id={session_id}")
        model = resp.json()[0]
        assert "model_id" in model
        assert "model_type" in model
        assert "model_name" in model
        assert "metrics" in model
        assert "training_time_ms" in model

    def test_nonexistent_session_returns_404(self, client):
        resp = client.get("/api/ml/models?session_id=fake-id")
        assert resp.status_code == 404


class TestCompare:
    """POST /api/ml/compare"""

    def test_compare_two_models(self, client):
        session_id = create_prepared_session(client)
        _train_model(client, session_id, "knn")
        _train_model(client, session_id, "random_forest")
        resp = client.post("/api/ml/compare", json={"session_id": session_id})
        assert resp.status_code == 200
        data = resp.json()
        assert "best_model_id" in data
        assert "best_by_metric" in data
        assert "models" in data
        assert len(data["models"]) == 2

    def test_compare_6_core_models(self, client):
        session_id = create_prepared_session(client)
        for m in ["knn", "svm", "decision_tree", "random_forest",
                   "logistic_regression", "naive_bayes"]:
            _train_model(client, session_id, m)
        resp = client.post("/api/ml/compare", json={"session_id": session_id})
        data = resp.json()
        assert len(data["models"]) == 6
        assert data["best_model_id"] is not None

    def test_compare_identifies_best_per_metric(self, client):
        session_id = create_prepared_session(client)
        _train_model(client, session_id, "knn")
        _train_model(client, session_id, "logistic_regression")
        resp = client.post("/api/ml/compare", json={"session_id": session_id})
        best_by = resp.json()["best_by_metric"]
        assert len(best_by) > 0

    def test_compare_no_duplicates(self, client):
        session_id = create_prepared_session(client)
        _train_model(client, session_id, "knn")
        _train_model(client, session_id, "knn")  # same model, different run
        resp = client.post("/api/ml/compare", json={"session_id": session_id})
        data = resp.json()
        assert len(data["models"]) == 2
        ids = [m["model_id"] for m in data["models"]]
        assert len(ids) == len(set(ids))  # all unique model_ids

    def test_compare_each_model_has_sensitivity(self, client):
        session_id = create_prepared_session(client)
        _train_model(client, session_id, "knn")
        _train_model(client, session_id, "svm")
        resp = client.post("/api/ml/compare", json={"session_id": session_id})
        for model in resp.json()["models"]:
            metric_names = [m["name"] for m in model["metrics"]]
            assert "sensitivity" in metric_names

    def test_compare_nonexistent_session_returns_404(self, client):
        resp = client.post("/api/ml/compare", json={"session_id": "fake-id"})
        assert resp.status_code == 404

    def test_compare_empty_session(self, client):
        session_id = create_prepared_session(client)
        resp = client.post("/api/ml/compare", json={"session_id": session_id})
        # Empty session may return 200 with empty models or 400
        assert resp.status_code in (200, 400)
