# backend/app/models/__init__.py

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# import all models so db.create_all() and migrations see them
from .user import User
from .message import Message
