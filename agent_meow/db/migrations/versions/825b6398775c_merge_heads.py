"""merge_heads

Revision ID: 825b6398775c
Revises: b1c2d3e4f5a7, c2d3e4f5a6b7
Create Date: 2026-07-23 01:59:58.612299
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '825b6398775c'
down_revision: Union[str, None] = ('b1c2d3e4f5a7', 'c2d3e4f5a6b7')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
