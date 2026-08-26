"""merge_heads

Revision ID: 98003f09ea51
Revises: 5c5fe73e94bd, z10a3b4c5d6e
Create Date: 2026-08-26 15:48:27.780577
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '98003f09ea51'
down_revision: Union[str, None] = ('5c5fe73e94bd', 'z10a3b4c5d6e')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
