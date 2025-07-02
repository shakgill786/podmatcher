"""add is_read to messages

Revision ID: 8df11841d38b
Revises: 3bc16c45a24e
Create Date: 2025-07-01 10:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '8df11841d38b'
down_revision = '3bc16c45a24e'
branch_labels = None
depends_on = None

def upgrade():
    # Drop any leftover temp‐table from a previous failed run
    op.execute("DROP TABLE IF EXISTS _alembic_tmp_messages")

    # 1) Add the column with a server_default so existing rows get a value
    with op.batch_alter_table('messages') as batch:
        batch.add_column(
            sa.Column(
                'is_read',
                sa.Boolean(),
                nullable=False,
                server_default=sa.text('0')   # SQLite uses 0/1 for booleans
            )
        )

    # 2) Remove the server_default so new inserts use your model’s default
    with op.batch_alter_table('messages') as batch:
        batch.alter_column('is_read', server_default=None)


def downgrade():
    # Simply drop the column on downgrade
    with op.batch_alter_table('messages') as batch:
        batch.drop_column('is_read')
