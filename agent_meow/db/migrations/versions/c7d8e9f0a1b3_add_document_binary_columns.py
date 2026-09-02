"""add binary columns to documents table (office-file round-trip)

Revision ID: c7d8e9f0a1b3
Revises: e5f6a7b8c9d0
Create Date: 2026-09-02 00:00:00.000000

Adds the binary representation columns to the ``documents`` table so
office files (docx/xlsx/pptx/pdf) can live as documents with their bytes
in the ArtifactStore — the same metadata-only pattern the ``images`` and
``videos`` tables use:

- ``filename``: original upload filename (NULL for markdown docs).
- ``mime``: payload MIME type.
- ``artifact_key``: ArtifactStore key of the binary bytes.
- ``bytes_size``: payload size in bytes (0 for markdown docs).
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "c7d8e9f0a1b3"
down_revision = "e5f6a7b8c9d0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("documents", sa.Column("filename", sa.String(512), nullable=True))
    op.add_column("documents", sa.Column("mime", sa.String(128), nullable=True))
    op.add_column("documents", sa.Column("artifact_key", sa.String(512), nullable=True))
    op.add_column(
        "documents",
        sa.Column("bytes_size", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("documents", "bytes_size")
    op.drop_column("documents", "artifact_key")
    op.drop_column("documents", "mime")
    op.drop_column("documents", "filename")