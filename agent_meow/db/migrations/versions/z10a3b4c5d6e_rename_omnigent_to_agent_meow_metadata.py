"""Rename omnigent_conversation_metadata to agent_meow_conversation_metadata.

Revision ID: z10a3b4c5d6e
Revises: z9a2b3c4d5e6
"""

from alembic import op
import sqlalchemy as sa

revision: str = "z10a3b4c5d6e"
down_revision: str | None = "z9a2b3c4d5e6"
branch_labels: str | None = None
depends_on: str | None = None


def _table_exists(bind, table_name: str) -> bool:
    result = bind.execute(
        sa.text(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=:name"
        ),
        {"name": table_name},
    )
    return result.fetchone() is not None


def upgrade() -> None:
    bind = op.get_bind()
    old = "omnigent_conversation_metadata"
    new = "agent_meow_conversation_metadata"
    if _table_exists(bind, old) and not _table_exists(bind, new):
        op.rename_table(old, new)


def downgrade() -> None:
    bind = op.get_bind()
    old = "omnigent_conversation_metadata"
    new = "agent_meow_conversation_metadata"
    if _table_exists(bind, new) and not _table_exists(bind, old):
        op.rename_table(new, old)