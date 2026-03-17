"""Tests for Step 1 — Clinical Context (domain selection endpoints).

Covers GET /api/domains and GET /api/domains/{id}.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from tests.conftest import ALL_DOMAIN_IDS


class TestDomainEndpoints:
    """Verify the domain listing and detail endpoints."""

    # ------------------------------------------------------------------
    # Domain list
    # ------------------------------------------------------------------

    def test_list_all_domains(self, client: TestClient) -> None:
        """GET /api/domains returns HTTP 200 with exactly 20 domains."""
        resp = client.get("/api/domains")
        assert resp.status_code == 200
        body = resp.json()
        assert body["count"] == 20
        assert len(body["domains"]) == 20

    def test_domain_list_has_required_fields(self, client: TestClient) -> None:
        """Every domain summary exposes the fields required by the frontend."""
        resp = client.get("/api/domains")
        assert resp.status_code == 200
        required_fields = {
            "id",
            "name",
            "icon",
            "short_description",
            "target_variable",
            "problem_type",
        }
        for domain in resp.json()["domains"]:
            missing = required_fields - set(domain.keys())
            assert not missing, (
                f"Domain '{domain.get('id')}' is missing fields: {missing}"
            )

    def test_domain_ids_are_unique(self, client: TestClient) -> None:
        """All 20 domain IDs in the list are distinct."""
        resp = client.get("/api/domains")
        assert resp.status_code == 200
        ids = [d["id"] for d in resp.json()["domains"]]
        assert len(ids) == len(set(ids)), "Duplicate domain IDs found"

    def test_domain_list_problem_type_values(self, client: TestClient) -> None:
        """Every domain has problem_type equal to 'binary' or 'multiclass'."""
        resp = client.get("/api/domains")
        assert resp.status_code == 200
        for domain in resp.json()["domains"]:
            assert domain["problem_type"] in {"binary", "multiclass"}, (
                f"Unexpected problem_type '{domain['problem_type']}' "
                f"for domain '{domain['id']}'"
            )

    # ------------------------------------------------------------------
    # Domain detail — cardiology
    # ------------------------------------------------------------------

    def test_get_cardiology_detail(self, client: TestClient) -> None:
        """GET /api/domains/cardiology returns 200 with full metadata."""
        resp = client.get("/api/domains/cardiology")
        assert resp.status_code == 200
        body = resp.json()
        assert body["id"] == "cardiology"
        # Required detail fields
        for field in (
            "clinical_question",
            "why_it_matters",
            "feature_names",
            "target_classes",
        ):
            assert field in body, f"Missing field '{field}' in cardiology detail"
        # Sanity checks
        assert isinstance(body["feature_names"], list)
        assert len(body["feature_names"]) > 0
        assert isinstance(body["target_classes"], list)
        assert len(body["target_classes"]) >= 2

    def test_cardiology_clinical_question_is_non_empty(
        self, client: TestClient
    ) -> None:
        """The cardiology domain has a non-blank clinical_question."""
        resp = client.get("/api/domains/cardiology")
        assert resp.status_code == 200
        assert resp.json()["clinical_question"].strip() != ""

    # ------------------------------------------------------------------
    # Parametrized: every domain returns 200
    # ------------------------------------------------------------------

    @pytest.mark.parametrize("domain_id", ALL_DOMAIN_IDS)
    def test_get_each_domain_by_id(
        self, client: TestClient, domain_id: str
    ) -> None:
        """Every one of the 20 domain IDs resolves to a 200 response."""
        resp = client.get(f"/api/domains/{domain_id}")
        assert resp.status_code == 200, (
            f"Expected 200 for domain '{domain_id}', got {resp.status_code}: "
            f"{resp.text}"
        )
        assert resp.json()["id"] == domain_id

    # ------------------------------------------------------------------
    # Parametrized: all domains have non-empty clinical_question
    # ------------------------------------------------------------------

    @pytest.mark.parametrize("domain_id", ALL_DOMAIN_IDS)
    def test_all_domains_have_clinical_question(
        self, client: TestClient, domain_id: str
    ) -> None:
        """Every domain detail includes a non-empty clinical_question string."""
        resp = client.get(f"/api/domains/{domain_id}")
        assert resp.status_code == 200
        question = resp.json().get("clinical_question", "")
        assert isinstance(question, str) and question.strip() != "", (
            f"Domain '{domain_id}' has an empty clinical_question"
        )

    # ------------------------------------------------------------------
    # 404 on unknown domain
    # ------------------------------------------------------------------

    def test_domain_not_found(self, client: TestClient) -> None:
        """GET /api/domains/<unknown> returns HTTP 404."""
        resp = client.get("/api/domains/nonexistent-domain-xyz")
        assert resp.status_code == 404

    def test_domain_not_found_body_has_detail(self, client: TestClient) -> None:
        """The 404 response body includes a 'detail' key."""
        resp = client.get("/api/domains/does-not-exist")
        assert resp.status_code == 404
        assert "detail" in resp.json()

    # ------------------------------------------------------------------
    # problem_type vs target_classes consistency
    # ------------------------------------------------------------------

    @pytest.mark.parametrize("domain_id", ALL_DOMAIN_IDS)
    def test_binary_vs_multiclass(
        self, client: TestClient, domain_id: str
    ) -> None:
        """problem_type is 'binary' iff target_classes has exactly 2 entries.

        Domains with more than 2 target classes must be declared 'multiclass'.
        """
        resp = client.get(f"/api/domains/{domain_id}")
        assert resp.status_code == 200
        body = resp.json()
        problem_type = body["problem_type"]
        n_classes = len(body["target_classes"])

        if problem_type == "binary":
            assert n_classes == 2, (
                f"Domain '{domain_id}' is binary but has {n_classes} target classes"
            )
        else:
            assert n_classes > 2, (
                f"Domain '{domain_id}' is multiclass but has only {n_classes} "
                f"target classes"
            )
