from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()  # ✅ Define db here

# ✅ Import models *after* db is defined
from .user import User
from .message import Message
