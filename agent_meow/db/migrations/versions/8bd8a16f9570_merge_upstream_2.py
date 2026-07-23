"""merge_upstream_2

Revision ID: 8bd8a16f9570
Revises: 825b6398775c, f4664ca64ea8
Create Date: 2026-07-23 07:53:28.490097
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8bd8a16f9570'
down_revision: Union[str, None] = ('825b6398775c', 'f4664ca64ea8')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
