"""add file_index_fts FTS5 table for workspace file search

Revision ID: d3e4f5a9b0c1
Revises: c2d3e4f5a9b0
Create Date: 2026-08-31 00:00:00.000000

Adds the FTS5 virtual table (plan 039 Phase 1) over ``file_index`` for
full-text search of indexed workspace files. The searchable body is
basename + kind + EXIF camera/date + doc text excerpt; the ``trigram``
tokenizer gives CJK substring match. Sync triggers keep the FTS shadow
in step with ``file_index`` inserts/updates and ``file_meta`` upserts.

The store also creates this table with ``CREATE VIRTUAL TABLE IF NOT
EXISTS`` on first open (same existence-aware pattern as the Phase 0
migration), so a runner that touches chat.db before the server migrates
won't collide.
"""

import sqlalchemy as sa
from alembic import op

revision = "d3e4f5a9b0c1"
down_revision = "c2d3e4f5a9b0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing = set(inspector.get_table_names())

    # The store's _ensure_table creates the FTS table + triggers with IF
    # NOT EXISTS, so on a DB the runner already touched this is a no-op.
    if "file_index_fts" in existing:
        return

    # FTS5 standalone table (stores body directly + file_id to join back).
    # The store's _install_fts registers the _file_index_fts_body SQL
    # function + sync triggers idempotently on every store construction.
    bind.execute(
        sa.text(
            "CREATE VIRTUAL TABLE file_index_fts USING fts5("
            "body, file_id UNINDEXED, "
            "tokenize='trigram case_sensitive 0')"
        )
    )


def downgrade() -> None:
    bind = op.get_bind()
    existing = set(sa.inspect(bind).get_table_names())
    # Drop the sync triggers first (they reference the FTS table).
    for trigger in (
        "file_index_fts_ai",
        "file_index_fts_au",
        "file_index_fts_ad",
        "file_index_fts_meta_ai",
        "file_index_fts_meta_au",
    ):
        bind.execute(sa.text(f"DROP TRIGGER IF EXISTS {trigger}"))
    if "file_index_fts" in existing:
        bind.execute(sa.text("DROP TABLE IF EXISTS file_index_fts"))
