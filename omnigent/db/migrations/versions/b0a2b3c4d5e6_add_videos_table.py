"""add videos table (agent-meow Video surface)

Revision ID: b0a2b3c4d5e6
Revises: a0a2b3c4d5e6
Create Date: 2026-07-17 00:00:00.000000

Adds the ``videos`` table for the agent-meow Video surface: per-session
video metadata (binary lives in the ArtifactStore). Managed by
:class:`~?omnigent.stores.video_store.VideoStore`.
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "b0a2b3c4d5e6"
down_revision = "a0a2b3c4d5e6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "videos",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("conversation_id", sa.String(64), nullable=False),
        sa.Column("filename", sa.String(512), nullable=False),
        sa.Column("mime", sa.String(128), nullable=False),
        sa.Column("artifact_key", sa.String(512), nullable=False),
        sa.Column("duration_seconds", sa.Float(), nullable=False, server_default="0"),
        sa.Column("width", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("height", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("bytes_size", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.BigInteger(), nullable=False),
        sa.Column("created_by", sa.String(128), nullable=True),
    )
    op.create_index("ix_videos_conversation_id", "videos", ["conversation_id"])
    op.create_index("ix_videos_created_at", "videos", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_videos_created_at", table_name="videos")
    op.drop_index("ix_videos_conversation_id", table_name="videos")
    op.drop_table("videos")