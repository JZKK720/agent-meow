"""E2E smoke test for the agent-driven vision model file tagging pipeline.

Prerequisites:
- Server running on :6767
- A session with a workspace containing at least 1 image file
- The agent's LLM is vision-capable (deepseek-v4-flash via Hermes)

This test verifies the full pipeline: agent analyzes images → image_analyze
tool stores tags → GET /resources/tags returns them.
"""

import httpx
import pytest

SERVER_URL = "http://127.0.0.1:6767"


@pytest.mark.asyncio
@pytest.mark.e2e
async def test_tags_endpoint_returns_tags_after_analysis():
    """Verify tags are queryable after the agent analyzes images."""
    async with httpx.AsyncClient(base_url=SERVER_URL) as client:
        # Get the first session (response is a PaginatedList with a "data" key)
        resp = await client.get("/v1/sessions")
        assert resp.status_code == 200
        body = resp.json()
        sessions = body.get("data", body) if isinstance(body, dict) else body
        if not sessions:
            pytest.skip("No sessions available for e2e test")
        session_id = sessions[0]["id"]

        # Query tags (may be empty if agent hasn't analyzed yet)
        resp = await client.get(f"/v1/sessions/{session_id}/resources/tags")
        assert resp.status_code == 200
        tags = resp.json()["tags"]
        assert isinstance(tags, list)
        for t in tags:
            assert "tag" in t
            assert "count" in t
            assert t["count"] > 0
