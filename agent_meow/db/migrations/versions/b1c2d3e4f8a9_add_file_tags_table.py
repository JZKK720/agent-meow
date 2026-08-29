"""add file_tags table for vision model image classification

Revision ID: b1c2d3e4f8a9
Revises: z10a3b4c5d6e
Create Date: 2026-08-29 00:00:00.000000

Adds the ``file_tags`` table for storing AI-generated tags for workspace
images. Populated by the runner's ``image_analyze`` tool dispatch handler
when the agent calls ``image_analyze`` after classifying an image with
its vision model.
"""

from alembic import op
import sqlalchemy as sa

revision = "b1c2d3e4f8a9"
down_revision = "z10a3b4c5d6e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "file_tags",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("conversation_id", sa.String(64), nullable=False),
        sa.Column("file_path", sa.String(1024), nullable=False),
        sa.Column("tag", sa.String(64), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("model", sa.String(128), nullable=False, server_default=""),
        sa.Column("analyzed_at", sa.Integer(), nullable=False),
    )
    op.create_index(
        "ix_file_tags_conversation_id", "file_tags", ["conversation_id"]
    )
    op.create_index(
        "uix_file_tags_conv_path_tag",
        "file_tags",
        ["conversation_id", "file_path", "tag"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("uix_file_tags_conv_path_tag", table_name="file_tags")
    op.drop_index("ix_file_tags_conversation_id", table_name="file_tags")
    op.drop_table("file_tags")
