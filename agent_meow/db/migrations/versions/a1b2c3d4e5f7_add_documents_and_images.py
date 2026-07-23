"""add documents and images tables (agent-meow Docs/Images surfaces)

Revision ID: o1a2b3c4d5e6
Revises: n1a2b3c4d5e6
Create Date: 2026-07-05 00:00:00.000000

Adds two new tables for the agent-meow Docs and Images surfaces:

- ``documents``: per-session rich-text documents (markdown + ProseMirror
  JSON). Managed by :class:`~?agent_meow.stores.document_store.DocumentStore`.
- ``images``: per-session image metadata (binary lives in the
  ArtifactStore). Managed by :class:`~?agent_meow.stores.image_store.ImageStore`.
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "a1b2c3d4e5f7"
down_revision = "n1a2b3c4d5e6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "documents",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("conversation_id", sa.String(64), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("format", sa.String(32), nullable=False, server_default="markdown"),
        sa.Column("content_md", sa.Text(), nullable=False, server_default=""),
        sa.Column("content_json", sa.Text(), nullable=True),
        sa.Column("created_at", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.BigInteger(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_by", sa.String(128), nullable=True),
    )
    op.create_index("ix_documents_conversation_id", "documents", ["conversation_id"])
    op.create_index("ix_documents_updated_at", "documents", ["updated_at"])

    op.create_table(
        "images",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("conversation_id", sa.String(64), nullable=False),
        sa.Column("filename", sa.String(512), nullable=False),
        sa.Column("mime", sa.String(128), nullable=False),
        sa.Column("artifact_key", sa.String(512), nullable=False),
        sa.Column("width", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("height", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("bytes_size", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("edit_json", sa.Text(), nullable=True),
        sa.Column("created_at", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.BigInteger(), nullable=False),
        sa.Column("created_by", sa.String(128), nullable=True),
    )
    op.create_index("ix_images_conversation_id", "images", ["conversation_id"])
    op.create_index("ix_images_created_at", "images", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_images_created_at", table_name="images")
    op.drop_index("ix_images_conversation_id", table_name="images")
    op.drop_table("images")
    op.drop_index("ix_documents_updated_at", table_name="documents")
    op.drop_index("ix_documents_conversation_id", table_name="documents")
    op.drop_table("documents")