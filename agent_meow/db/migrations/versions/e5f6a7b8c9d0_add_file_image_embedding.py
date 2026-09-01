"""add file_image_embedding table for CLIP visual search (plan 039 phase 2)

One embedding row per indexed image file. The vector blob is little-endian
float32 in the image-encoder's native dimension (512 for ViT-B/32) — the
runner brute-forces cosine KNN in numpy at personal-workspace scale (a
sqlite-vec virtual table is an optimization once workspaces exceed ~100k
images, not needed for correctness).

Chains the plan-039 FTS migration; keeps the single-head rule.
"""

revision = "e5f6a7b8c9d0"
down_revision = "d3e4f5a9b0c1"
branch_labels = None
depends_on = None

from alembic import op  # noqa: E402
import sqlalchemy as sa  # noqa: E402

_TABLE = "file_image_embedding"


def upgrade() -> None:
    bind = op.get_bind()
    existing = {
        row[0]
        for row in bind.execute(
            sa.text("SELECT name FROM sqlite_master WHERE type='table'")
        ).fetchall()
    }
    if _TABLE not in existing:
        bind.execute(
            sa.text(
                f"""
                CREATE TABLE {_TABLE} (
                    id TEXT PRIMARY KEY NOT NULL,
                    file_id TEXT NOT NULL REFERENCES file_index(id) ON DELETE CASCADE,
                    model TEXT NOT NULL,
                    dim INTEGER NOT NULL,
                    vector BLOB NOT NULL,
                    created_at TIMESTAMP NOT NULL
                )
                """
            )
        )
        bind.execute(
            sa.text(
                f"CREATE UNIQUE INDEX {_TABLE}_file_model_uq "
                f"ON {_TABLE}(file_id, model)"
            )
        )


def downgrade() -> None:
    bind = op.get_bind()
    bind.execute(sa.text(f"DROP INDEX IF EXISTS {_TABLE}_file_model_uq"))
    bind.execute(sa.text(f"DROP TABLE IF EXISTS {_TABLE}"))