"""cash to bs

Revision ID: 53d8f424a27c
Revises: 343b8c0206bd
Create Date: 2024-10-04 01:21:21.073615

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '53d8f424a27c'
down_revision = '343b8c0206bd'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('bs_table', schema=None) as batch_op:
        batch_op.add_column(sa.Column('cash_and_equiv', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('cash_all', sa.Integer(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('bs_table', schema=None) as batch_op:
        batch_op.drop_column('cash_all')
        batch_op.drop_column('cash_and_equiv')

    # ### end Alembic commands ###
