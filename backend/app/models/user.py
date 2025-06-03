from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

class User(db.Model, UserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    hashed_password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50))  # 'host' or 'guest'
    bio = db.Column(db.Text)
    category = db.Column(db.String(100))  # podcast niche
    audio_url = db.Column(db.String(255))
    
    def set_password(self, password):
        self.hashed_password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)
    def to_dict(self):
        return {
        "id": self.id,
        "username": self.username,
        "email": self.email,
        "role": self.role,
        "bio": self.bio,
        "category": self.category,
    }
