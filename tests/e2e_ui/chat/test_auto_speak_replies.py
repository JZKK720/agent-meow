"""E2E: completed assistant replies are spoken back (dictation voiceback).

Regression guard for the dictation→TTS gap: routing the composer mic at the
text-only server dictation path dropped the Hermes voice pipeline that used
to synthesize every reply, so replies arrived as silent bubbles. The fix is a
page-level auto-speak effect in ``ChatPage.tsx``: when the send's response
flips to ``completed`` and the ``agent-meow:auto-speak-replies`` preference
(default ON) allows it, the reply text is posted to ``/v1/audio/speech`` —
the same TTS endpoint the manual "Read aloud" button uses.

The tests drive the real UI against the mock LLM and intercept
``/v1/audio/speech`` with ``page.route`` so no TTS backend is required:

- ON (default): sending a message fires a speech request whose body carries
  the reply text.
- OFF: with the preference seeded to ``"false"``, the reply completes but no
  speech request is made.

A failure here means one of:

- The auto-speak effect broke (``ChatPage.tsx`` — the ``shouldAutoSpeakReply``
  gate or the ``activeResponse`` completion edge).
- The preference plumbing broke (``web/src/lib/autoSpeakPreferences.ts``).
- The reply lifecycle changed so ``completed`` never lands (chatStore).
"""

from __future__ import annotations

import base64
import json
import re

from playwright.sync_api import Page, expect

from tests.e2e_ui.conftest import configure_mock_llm

_COMPOSER = "Ask the agent anything…"
_ASSISTANT = '[data-testid="message-bubble"][data-role="assistant"]'
_WORKING = '[data-testid="working-indicator"]'
_SPEECH_ROUTE = re.compile(r"/v1/audio/speech($|\?)")
_PREF_KEY = "agent-meow:auto-speak-replies"

# A tiny silent WAV (44-byte header + 8 zero samples). The browser may fail
# to play it headless — playReadAloud swallows that — but the fetch (the
# behavior under test) completes with a valid audio response.
_WAV_B64 = (
    "UklGRhoAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQgAAAAAAAAAAAAAA"
)

_REPLY = "The capital of France is Paris."


def _mock_speech(page: Page, seen: list[dict]) -> None:
    """Intercept TTS fetches, record their bodies, and return silent audio.

    :param page: Playwright page to install the route on.
    :param seen: List appended per intercepted request with the decoded JSON
        body — the test asserts against this instead of a live TTS server.
    """

    def _handle(route):
        try:
            seen.append(json.loads(route.request.post_data or "{}"))
        except ValueError:
            seen.append({})
        route.fulfill(
            status=200,
            content_type="audio/wav",
            body=base64.b64decode(_WAV_B64),
        )

    page.route(_SPEECH_ROUTE, _handle)


def _send_and_complete(page: Page, base_url: str, session_id: str, prompt: str) -> None:
    """Open the session, send *prompt*, and wait for the reply to render.

    Waits for the assistant bubble AND the working indicator to clear — the
    auto-speak effect fires on the same ``completed`` edge that clears it, so
    by the time this returns, an intended speech request has already fired.
    """
    page.goto(f"{base_url}/c/{session_id}")
    composer = page.get_by_placeholder(_COMPOSER)
    expect(composer).to_be_visible()
    composer.fill(prompt)
    page.get_by_role("button", name="Send", exact=True).click()
    expect(page.locator(_ASSISTANT).first).to_be_visible(timeout=60_000)
    expect(page.locator(_WORKING)).to_have_count(0, timeout=60_000)


def test_reply_is_spoken_back_by_default(
    page: Page,
    seeded_session: tuple[str, str],
    mock_llm_server_url: str,
) -> None:
    """With no stored preference (default ON), a completed reply hits TTS."""
    base_url, session_id = seeded_session
    prompt = "auto-speak-on-what-is-the-capital-of-france"
    configure_mock_llm(
        mock_llm_server_url, [{"text": _REPLY}], key="auto-speak-on", match=prompt
    )

    seen: list[dict] = []
    _mock_speech(page, seen)
    _send_and_complete(page, base_url, session_id, prompt)

    # The auto-speak effect posts the reply text to /v1/audio/speech once the
    # response completes (the fetch fires a tick after the completion edge —
    # speakText dynamically imports the sanitizer first — so wait briefly).
    # Chunk splits mean the union of bodies covers the reply; assert the
    # chunk carrying "Paris" arrives.
    page.wait_for_timeout(2_000)
    joined = " ".join(str(body.get("text") or body.get("input") or "") for body in seen)
    assert seen, "expected the completed reply to trigger a /v1/audio/speech request"
    assert "Paris" in joined, f"speech request should carry the reply text, got: {joined!r}"


def test_auto_speak_pref_off_keeps_replies_silent(
    page: Page,
    seeded_session: tuple[str, str],
    mock_llm_server_url: str,
) -> None:
    """With the preference seeded off, the reply completes with no TTS call."""
    base_url, session_id = seeded_session
    prompt = "auto-speak-off-what-is-the-capital-of-france"
    configure_mock_llm(
        mock_llm_server_url, [{"text": _REPLY}], key="auto-speak-off", match=prompt
    )
    page.add_init_script(f"localStorage.setItem({_PREF_KEY!r}, 'false');")

    seen: list[dict] = []
    _mock_speech(page, seen)
    _send_and_complete(page, base_url, session_id, prompt)
    page.wait_for_timeout(2_000)

    assert not seen, f"auto-speak is off; expected no TTS requests, got: {seen!r}"
