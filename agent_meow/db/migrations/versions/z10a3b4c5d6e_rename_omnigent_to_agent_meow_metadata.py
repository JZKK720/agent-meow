"""Rename omnigent_conversation_metadata to agent_meow_conversation_metadata.

Revision ID: z10a3b4c5d6e
Revises: z9a2b3c4d5e6

This migration was added during the omnigent → agent-meow rebrand
(Plan 032) to rename the metadata table. The same rename already landed
on the main development chain (``c2d3e4f5a6b7`` references
``agent_meow_conversation_metadata``), so by the time this revision runs
the table is already named ``agent_meow_conversation_metadata`` — and
on a fresh DB that hasn't run the main chain yet, neither name exists.

The original body renamed ``agent_meow_conversation_metadata`` to
itself (a no-op that errored when the table was absent). Guard the
rename so it only fires when the *old* ``omnigent_conversation_metadata``
table actually exists; otherwise this is a safe no-op.
"""

from __future__ import annotations

from alembic import op

revision: str = "z10a3b4c5d6e"
down_revision: str | None = "z9a2b3c4d5e6"
branch_labels: str | None = None
depends_on: str | None = None


def _has_table(bind, name: str) -> bool:
    """Return whether *name* exists in the current database."""
    from sqlalchemy import inspect

    return inspect(bind).has_table(name)


def upgrade() -> None:
    bind = op.get_bind()
    # Only rename when the legacy table is still present. The main chain
    # already renamed it, so this is usually a no-op.
    if _has_table(bind, "omnigent_conversation_metadata"):
        op.rename_table(
            "omnigent_conversation_metadata",
            "agent_meow_conversation_metadata",
        )


def downgrade() -> None:
    bind = op.get_bind()
    if _has_table(bind, "agent_meow_conversation_metadata"):
        op.rename_table(
            "agent_meow_conversation_metadata",
            "omnigent_conversation_metadata",
        )