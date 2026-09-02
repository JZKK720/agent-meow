"""add notes and snippets tables (Notes + Code Snippets surfaces)

Revision ID: e6f7a8b9c0d1
Revises: c7d8e9f0a1b3
Create Date: 2026-09-02 00:00:00.000000

Creates the two per-session surface tables:

- ``notes``: lightweight markdown notes with pinning and comma-separated
  tags (Notes surface — lighter than ``documents``).
- ``snippets``: reusable language-tagged code snippets with description
  and comma-separated tags, searchable via substring match.
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "e6f7a8b9c0d1"
down_revision = "c7d8e9f0a1b3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "notes",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("conversation_id", sa.String(64), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("body_md", sa.Text(), nullable=False, server_default=""),
        sa.Column("pinned", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("tags", sa.String(512), nullable=False, server_default=""),
        sa.Column("created_at", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.BigInteger(), nullable=False),
        sa.Column("created_by", sa.String(128), nullable=True),
    )
    op.create_index("ix_notes_conversation_id", "notes", ["conversation_id"])
    op.create_index("ix_notes_updated_at", "notes", ["updated_at"])

    op.create_table(
        "snippets",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("conversation_id", sa.String(64), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("language", sa.String(64), nullable=False, server_default="text"),
        sa.Column("code", sa.Text(), nullable=False, server_default=""),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("tags", sa.String(512), nullable=False, server_default=""),
        sa.Column("created_at", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.BigInteger(), nullable=False),
        sa.Column("created_by", sa.String(128), nullable=True),
    )
    op.create_index("ix_snippets_conversation_id", "snippets", ["conversation_id"])
    op.create_index("ix_snippets_updated_at", "snippets", ["updated_at"])


def downgrade() -> None:
    op.drop_index("ix_snippets_updated_at", table_name="snippets")
    op.drop_index("ix_snippets_conversation_id", table_name="snippets")
    op.drop_table("snippets")
    op.drop_index("ix_notes_updated_at", table_name="notes")
    op.drop_index("ix_notes_conversation_id", table_name="notes")
    op.drop_table("notes")