"""Tests for Step 4 — Model Selection & Training.

Covers:
  GET  /api/ml/hyperparams/{model_type}
  POST /api/ml/train
"""

import pytest

from tests.conftest import create_mapped_session, create_prepared_session, ALL_DOMAIN_IDS

CORE_MODELS = [
    "knn",
    "svm",
    "decision_tree",
    "random_forest",
    "logistic_regression",
    "naive_bayes",
]
ALL_MODELS = CORE_MODELS + ["xgboost", "lightgbm"]
REQUIRED_METRICS = [
    "accuracy",
    "sensitivity",
    "specificity",
    "precision",
    "f1",
    "auc_roc",
]


# -----------------------------------------------------------------------
# Hyperparameter endpoint tests
# -----------------------------------------------------------------------


class TestHyperparams:
    """GET /api/ml/hyperparams/{model_type}"""

    def test_knn_returns_params(self, client):
        resp = client.get("/api/ml/hyperparams/knn")
        assert resp.status_code == 200
        data = resp.json()
        assert "params" in data
        param_names = [p["name"] for p in data["params"]]
        assert "n_neighbors" in param_names
        assert "metric" in param_names

    def test_knn_k_range(self, client):
        resp = client.get("/api/ml/hyperparams/knn")
        params = {p["name"]: p for p in resp.json()["params"]}
        k_param = params["n_neighbors"]
        assert k_param["min"] >= 1
        assert k_param["max"] >= 25
        assert k_param["type"] == "int"

    def test_knn_distance_options(self, client):
        resp = client.get("/api/ml/hyperparams/knn")
        params = {p["name"]: p for p in resp.json()["params"]}
        metric_param = params["metric"]
        assert metric_param["type"] == "select"
        assert "euclidean" in metric_param["options"]
        assert "manhattan" in metric_param["options"]

    @pytest.mark.parametrize("model_type", ALL_MODELS)
    def test_all_models_return_hyperparams(self, client, model_type):
        resp = client.get(f"/api/ml/hyperparams/{model_type}")
        assert resp.status_code == 200
        data = resp.json()
        assert "params" in data
        assert len(data["params"]) >= 1
        for p in data["params"]:
            assert "name" in p
            assert "type" in p
            assert "default" in p

    def test_each_param_has_description(self, client):
        resp = client.get("/api/ml/hyperparams/knn")
        for p in resp.json()["params"]:
            assert "description" in p
            assert len(p["description"]) > 0, f"Param {p['name']} missing description"

    def test_invalid_model_returns_400(self, client):
        resp = client.get("/api/ml/hyperparams/nonexistent_model")
        assert resp.status_code == 400


# -----------------------------------------------------------------------
# Training endpoint tests
# -----------------------------------------------------------------------


class TestTraining:
    """POST /api/ml/train"""

    def test_train_knn_default(self, client):
        session_id = create_prepared_session(client)
        resp = client.post(
            "/api/ml/train",
            json={
                "session_id": session_id,
                "model_type": "knn",
                "hyperparams": {},
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "model_id" in data
        assert data["model_type"] == "knn"
        assert "metrics" in data
        assert "confusion_matrix" in data

    @pytest.mark.parametrize("model_type", CORE_MODELS)
    def test_train_all_6_core_models(self, client, model_type):
        session_id = create_prepared_session(client)
        resp = client.post(
            "/api/ml/train",
            json={
                "session_id": session_id,
                "model_type": model_type,
                "hyperparams": {},
            },
        )
        assert resp.status_code == 200
        assert resp.json()["model_type"] == model_type

    def test_train_returns_all_6_metrics(self, client):
        session_id = create_prepared_session(client)
        resp = client.post(
            "/api/ml/train",
            json={
                "session_id": session_id,
                "model_type": "knn",
                "hyperparams": {},
            },
        )
        data = resp.json()
        metric_names = [m["name"] for m in data["metrics"]]
        for required in REQUIRED_METRICS:
            assert required in metric_names, f"Missing metric: {required}"

    def test_metrics_have_status_field(self, client):
        session_id = create_prepared_session(client)
        resp = client.post(
            "/api/ml/train",
            json={
                "session_id": session_id,
                "model_type": "random_forest",
                "hyperparams": {},
            },
        )
        for m in resp.json()["metrics"]:
            assert "status" in m
            assert m["status"] in ("good", "moderate", "poor")

    def test_sensitivity_is_priority(self, client):
        session_id = create_prepared_session(client)
        resp = client.post(
            "/api/ml/train",
            json={
                "session_id": session_id,
                "model_type": "knn",
                "hyperparams": {},
            },
        )
        metrics = resp.json()["metrics"]
        sens = next(m for m in metrics if m["name"] == "sensitivity")
        assert sens["is_priority"] is True

    def test_confusion_matrix_binary_2x2(self, client):
        session_id = create_prepared_session(client)
        resp = client.post(
            "/api/ml/train",
            json={
                "session_id": session_id,
                "model_type": "decision_tree",
                "hyperparams": {},
            },
        )
        cm = resp.json()["confusion_matrix"]
        assert "matrix" in cm
        assert "labels" in cm
        assert len(cm["matrix"]) == 2
        assert len(cm["matrix"][0]) == 2

    def test_roc_curve_structure(self, client):
        session_id = create_prepared_session(client)
        resp = client.post(
            "/api/ml/train",
            json={
                "session_id": session_id,
                "model_type": "logistic_regression",
                "hyperparams": {},
            },
        )
        roc = resp.json()["roc_curve"]
        assert "fpr" in roc
        assert "tpr" in roc
        assert "auc" in roc
        assert len(roc["fpr"]) == len(roc["tpr"])
        assert 0.0 <= roc["auc"] <= 1.0

    def test_pr_curve_structure(self, client):
        session_id = create_prepared_session(client)
        resp = client.post(
            "/api/ml/train",
            json={
                "session_id": session_id,
                "model_type": "knn",
                "hyperparams": {},
            },
        )
        pr = resp.json()["pr_curve"]
        assert "precision_values" in pr or "precision" in pr
        assert "auc" in pr

    def test_cross_validation_present(self, client):
        session_id = create_prepared_session(client)
        resp = client.post(
            "/api/ml/train",
            json={
                "session_id": session_id,
                "model_type": "knn",
                "hyperparams": {},
            },
        )
        cv = resp.json()["cross_validation"]
        assert "fold_scores" in cv
        assert "mean" in cv
        assert "std" in cv
        assert "n_folds" in cv
        assert len(cv["fold_scores"]) == cv["n_folds"]

    def test_training_latency_under_3s(self, client):
        session_id = create_prepared_session(client)
        resp = client.post(
            "/api/ml/train",
            json={
                "session_id": session_id,
                "model_type": "knn",
                "hyperparams": {},
            },
        )
        assert resp.json()["training_time_ms"] < 3000

    def test_overfit_fields_present(self, client):
        session_id = create_prepared_session(client)
        resp = client.post(
            "/api/ml/train",
            json={
                "session_id": session_id,
                "model_type": "random_forest",
                "hyperparams": {},
            },
        )
        data = resp.json()
        assert "train_accuracy" in data
        assert "test_accuracy" in data
        assert 0 <= data["train_accuracy"] <= 1
        assert 0 <= data["test_accuracy"] <= 1

    def test_train_knn_custom_k(self, client):
        session_id = create_prepared_session(client)
        resp = client.post(
            "/api/ml/train",
            json={
                "session_id": session_id,
                "model_type": "knn",
                "hyperparams": {"n_neighbors": 3},
            },
        )
        assert resp.status_code == 200
        assert resp.json()["hyperparams"]["n_neighbors"] == 3

    def test_train_without_preparation_returns_400(self, client):
        session_id = create_mapped_session(client)
        resp = client.post(
            "/api/ml/train",
            json={
                "session_id": session_id,
                "model_type": "knn",
                "hyperparams": {},
            },
        )
        assert resp.status_code == 400

    def test_train_invalid_model_returns_400(self, client):
        session_id = create_prepared_session(client)
        resp = client.post(
            "/api/ml/train",
            json={
                "session_id": session_id,
                "model_type": "fake_model",
                "hyperparams": {},
            },
        )
        assert resp.status_code == 400

    def test_train_nonexistent_session_returns_404(self, client):
        resp = client.post(
            "/api/ml/train",
            json={
                "session_id": "nonexistent-session-id",
                "model_type": "knn",
                "hyperparams": {},
            },
        )
        assert resp.status_code == 404

    @pytest.mark.parametrize(
        "domain_id",
        ["cardiology", "nephrology", "oncology-breast", "neurology", "endocrinology"],
    )
    def test_train_across_5_domains(self, client, domain_id):
        session_id = create_prepared_session(client, domain_id=domain_id)
        resp = client.post(
            "/api/ml/train",
            json={
                "session_id": session_id,
                "model_type": "knn",
                "hyperparams": {},
            },
        )
        assert resp.status_code == 200
        assert len(resp.json()["metrics"]) >= 6

    def test_metric_values_in_valid_range(self, client):
        session_id = create_prepared_session(client)
        resp = client.post(
            "/api/ml/train",
            json={
                "session_id": session_id,
                "model_type": "random_forest",
                "hyperparams": {},
            },
        )
        for m in resp.json()["metrics"]:
            if m["name"] == "mcc":
                # MCC ranges from -1 to 1
                assert -1.0 <= m["value"] <= 1.0, f"{m['name']} out of range: {m['value']}"
            else:
                assert 0.0 <= m["value"] <= 1.0, f"{m['name']} out of range: {m['value']}"

    def test_multiple_trains_same_session(self, client):
        session_id = create_prepared_session(client)
        for model in ["knn", "decision_tree", "logistic_regression"]:
            resp = client.post(
                "/api/ml/train",
                json={
                    "session_id": session_id,
                    "model_type": model,
                    "hyperparams": {},
                },
            )
            assert resp.status_code == 200
