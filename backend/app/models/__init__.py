# backend/app/models/__init__.py

from flask_sqlalchemy import SQLAlchemy

# ─── Initialize the ORM ─────────────────────────────────────────────────────────
db = SQLAlchemy()

# ─── Association table for self-referential follows ────────────────────────────
followers = db.Table(
    "followers",
    db.Column("follower_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
    db.Column("followed_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
    extend_existing=True,  # allow redefining without error
)

# ─── Import models so Alembic/migrations will see them ─────────────────────────
from .user import User
from .message import Message
