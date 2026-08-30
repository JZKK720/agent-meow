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
    # Existence-aware: the stores create their tables with
    # CREATE TABLE IF NOT EXISTS on first open, and the runner can touch
    # chat.db before the server has migrated. A plain create_table would
    # then die with "table already exists" (same trap as the rebrand
    # metadata-rename migration). Skip whatever already exists.
    existing = set(sa.inspect(op.get_bind()).get_table_names())

    if "file_index" not in existing:
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
        op.create_index(
            "ix_file_index_ws_kind", "file_index", ["host_id", "workspace", "kind"]
        )
        op.create_index(
            "ix_file_index_hash", "file_index", ["host_id", "workspace", "content_hash"]
        )

    if "file_meta" not in existing:
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
    existing = set(sa.inspect(op.get_bind()).get_table_names())
    if "file_meta" in existing:
        op.drop_table("file_meta")
    if "file_index" in existing:
        op.drop_index("ix_file_index_hash", table_name="file_index")
        op.drop_index("ix_file_index_ws_kind", table_name="file_index")
        op.drop_index("ix_file_index_status", table_name="file_index")
        op.drop_index("uix_file_index_ws_path", table_name="file_index")
        op.drop_table("file_index")
