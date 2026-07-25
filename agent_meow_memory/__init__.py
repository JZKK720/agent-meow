"""agent-meow-memory: MCP server exposing Hermes session memory as tools.

Reads Hermes' native SQLite state.db (FTS5 conversations), MEMORY.md, and
USER.md (Honcho profile) to provide recall_sessions, recall_memories, and
recall_profile tools to any MCP-compatible agent.

Usage (stdio transport):
    uvx agent-meow-memory@latest
    # or: python -m agent_meow_memory
"""

from __future__ import annotations

import json
import os
import sqlite3
from pathlib import Path
from typing import Any


def _hermes_home() -> Path:
    configured = os.environ.get("HERMES_HOME")
    return Path(configured).expanduser() if configured else Path.home() / ".hermes"


def _connect_state_db() -> sqlite3.Connection | None:
    db_path = _hermes_home() / "state.db"
    if not db_path.is_file():
        return None
    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    return conn


def _search_fts(conn: sqlite3.Connection, query: str, limit: int = 10) -> list[dict[str, Any]]:
    """Search Hermes FTS5 messages_content index for matching conversations."""
    results: list[dict[str, Any]] = []
    try:
        rows = conn.execute(
            """SELECT content, session_id FROM messages_content
               WHERE messages_content MATCH ?
               ORDER BY rank LIMIT ?""",
            (query, limit),
        ).fetchall()
    except sqlite3.OperationalError:
        # FTS5 table may not exist or match syntax error
        return results

    seen: set[str] = set()
    for row in rows:
        sid = row["session_id"]
        if sid in seen:
            continue
        seen.add(sid)
        # Get session metadata
        session = conn.execute(
            "SELECT id, source, cwd, started_at FROM sessions WHERE id = ?",
            (sid,),
        ).fetchone()
        snippet = row["content"]
        if len(snippet) > 300:
            snippet = snippet[:297] + "..."
        results.append(
            {
                "session_id": sid,
                "snippet": snippet,
                "source": session["source"] if session else "unknown",
                "cwd": session["cwd"] if session else None,
                "started_at": session["started_at"] if session else None,
            }
        )
    return results


def _fallback_search(conn: sqlite3.Connection, query: str, limit: int = 10) -> list[dict[str, Any]]:
    """Fallback: LIKE search on messages.content when FTS unavailable."""
    results: list[dict[str, Any]] = []
    search_term = f"%{query}%"
    rows = conn.execute(
        """SELECT DISTINCT m.session_id, s.source, s.cwd, s.started_at,
                  substr(m.content, 1, 300) as snippet
           FROM messages m
           LEFT JOIN sessions s ON s.id = m.session_id
           WHERE m.content LIKE ? AND m.role IN ('user', 'assistant')
           ORDER BY m.timestamp DESC LIMIT ?""",
        (search_term, limit),
    ).fetchall()
    for row in rows:
        results.append(
            {
                "session_id": row["session_id"],
                "snippet": row["snippet"],
                "source": row["source"] or "unknown",
                "cwd": row["cwd"],
                "started_at": row["started_at"],
            }
        )
    return results


def _read_markdown_file(filename: str) -> str | None:
    """Read a markdown file from the Hermes home directory, if it exists."""
    path = _hermes_home() / filename
    if not path.is_file():
        return None
    try:
        return path.read_text(encoding="utf-8")
    except OSError:
        return None


def _search_memories(query: str) -> list[str]:
    """Search MEMORY.md for entries matching the query."""
    content = _read_markdown_file("MEMORY.md")
    if not content:
        return []
    # Split by markdown headings or double newlines
    entries = [e.strip() for e in content.split("\n\n") if e.strip()]
    # Simple case-insensitive substring match
    query_lower = query.lower()
    return [e for e in entries if query_lower in e.lower() and len(e) > 10]


def recall_sessions(query: str) -> list[dict[str, Any]]:
    """Search Hermes FTS5 for past conversations matching the query.

    Args:
        query: Search term to find in conversation history.

    Returns:
        List of matching sessions with session_id, snippet, and metadata.
    """
    conn = _connect_state_db()
    if conn is None:
        return []
    try:
        results = _search_fts(conn, query)
        if not results:
            results = _fallback_search(conn, query)
        return results
    finally:
        conn.close()


def recall_memories(query: str) -> list[str]:
    """Search MEMORY.md for relevant explicit memory entries.

    Args:
        query: Search term to find in stored memories.

    Returns:
        List of matching memory entries.
    """
    return _search_memories(query)


def recall_profile() -> dict[str, Any] | None:
    """Return the Honcho user profile from USER.md, if it exists.

    Returns:
        Dictionary with profile content, or None if USER.md not found.
    """
    content = _read_markdown_file("USER.md")
    if content is None:
        return None
    return {"source": "USER.md", "content": content}


# ── MCP stdio server ──────────────────────────────────────────────────────────


def _main() -> None:
    """Run the MCP server via stdio transport."""
    from mcp.server import Server
    from mcp.server.stdio import stdio_server

    server = Server("agent-meow-memory")

    @server.tool()
    def recall_sessions_tool(query: str) -> list[dict[str, Any]]:
        """Search Hermes conversation history for past sessions matching the query.

        Args:
            query: Search term to find in conversations.
        """
        return recall_sessions(query)

    @server.tool()
    def recall_memories_tool(query: str) -> list[str]:
        """Search MEMORY.md for relevant explicit memory entries.

        Args:
            query: Search term to find in stored memories.
        """
        return recall_memories(query)

    @server.tool()
    def recall_profile_tool() -> dict[str, Any] | None:
        """Return the Honcho user profile from USER.md."""
        return recall_profile()

    async def run():
        async with stdio_server() as (read_stream, write_stream):
            await server.run(read_stream, write_stream, server.create_initialization_options())

    import asyncio

    asyncio.run(run())


if __name__ == "__main__":
    _main()
