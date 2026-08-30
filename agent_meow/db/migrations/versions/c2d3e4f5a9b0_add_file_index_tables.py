"""add file_index + file_meta tables for workspace file intelligence

Revision ID: c2d3e4f5a9b0
Revises: b1c2d3e4f8a9
Create Date: 2026-08-30 00:00:00.000000

Adds the workspace-scoped file index (plan 039 Phase 0): ``file_index``
tracks one row per (host, workspace, path) with lifecycle status, and
``file_meta`` holds the worker-extracted metadata JSON (EXIF, document
text excerpt, perceptual hash inputs). Populated by the runner's file
watcher + meta worker; read by the server's file-search endpoints.
"""

import sqlalchemy as sa
from alembic import op

revision = "c2d3e4f5a9b0"
down_revision = "b1c2d3e4f8a9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "file_index",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("host_id", sa.String(64), nullable=False, server_default=""),
        sa.Column("workspace", sa.String(1024), nullable=False),
        sa.Column("path", sa.String(2048), nullable=False),
        sa.Column("kind", sa.String(16), nullable=False),
        sa.Column("size", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("mtime_ns", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("content_hash", sa.String(64), nullable=False, server_default=""),
        sa.Column("status", sa.String(16), nullable=False, server_default="pending"),
        sa.Column("thumb_path", sa.String(2048), nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("indexed_at", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.Integer(), nullable=False),
    )
    op.create_index(
        "uix_file_index_ws_path",
        "file_index",
        ["host_id", "workspace", "path"],
        unique=True,
    )
    op.create_index("ix_file_index_status", "file_index", ["status"])
    op.create_index("ix_file_index_ws_kind", "file_index", ["host_id", "workspace", "kind"])
    op.create_index("ix_file_index_hash", "file_index", ["host_id", "workspace", "content_hash"])

    op.create_table(
        "file_meta",
        sa.Column(
            "file_id",
            sa.String(64),
            sa.ForeignKey("file_index.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("meta_json", sa.Text(), nullable=False, server_default="{}"),
    )


def downgrade() -> None:
    op.drop_table("file_meta")
    op.drop_index("ix_file_index_hash", table_name="file_index")
    op.drop_index("ix_file_index_ws_kind", table_name="file_index")
    op.drop_index("ix_file_index_status", table_name="file_index")
    op.drop_index("uix_file_index_ws_path", table_name="file_index")
    op.drop_table("file_index")
