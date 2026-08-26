"""Rename agent_meow_conversation_metadata to agent_meow_conversation_metadata.

Revision ID: z10a3b4c5d6e
Revises: z9a2b3c4d5e6
"""

from alembic import op

revision: str = "z10a3b4c5d6e"
down_revision: str | None = "z9a2b3c4d5e6"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.rename_table(
        "agent_meow_conversation_metadata",
        "agent_meow_conversation_metadata",
    )


def downgrade() -> None:
    op.rename_table(
        "agent_meow_conversation_metadata",
        "agent_meow_conversation_metadata",
    )