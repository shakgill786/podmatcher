from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User  # ✅ Add this to expose User model
