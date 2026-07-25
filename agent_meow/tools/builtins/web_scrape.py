"""Built-in tool: web_scrape — resilient web scraping via Scrapling.

Uses Scrapling's StealthyFetcher (anti-bot bypass + headless-browser
rendering) to extract content from pages that block plain HTTP requests.
Runner-dispatched: the runner intercepts the call and drives Scrapling
directly (no sub-agent needed — this is a simple fetch-and-return).
"""

from __future__ import annotations

import json
from typing import Any

from agent_meow.tools.base import Tool


class WebScrapeTool(Tool):
    """Scrape a web page with anti-bot bypass and JS rendering.

    Runner-dispatched: the runner shells out to Scrapling's
    StealthyFetcher (headless Chrome) or DynamicFetcher (JS-rendered
    DOM). Returns the extracted text/HTML.
    """

    @classmethod
    def name(cls) -> str:
        return "web_scrape"

    @classmethod
    def description(cls) -> str:
        return (
            "Scrape a web page with anti-bot bypass and JavaScript rendering. "
            "Use this when plain web_fetch gets blocked (403, CAPTCHA, "
            "empty content). Uses Scrapling's StealthyFetcher for bot-evasive "
            "fetching. Returns the page content as markdown or HTML."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": WebScrapeTool.name(),
                "description": WebScrapeTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "url": {
                            "type": "string",
                            "description": "The URL to scrape.",
                        },
                        "format": {
                            "type": "string",
                            "enum": ["markdown", "html", "text"],
                            "description": "Output format (default: markdown).",
                        },
                        "stealth": {
                            "type": "boolean",
                            "description": (
                                "Use StealthyFetcher (anti-bot bypass) "
                                "instead of basic DynamicFetcher. "
                                "Slower but works on bot-protected sites."
                            ),
                        },
                        "wait_ms": {
                            "type": "integer",
                            "description": (
                                "Wait time in milliseconds for JS to "
                                "execute (default: 3000). Increase for "
                                "slow-loading pages."
                            ),
                        },
                    },
                    "required": ["url"],
                },
            },
        }
