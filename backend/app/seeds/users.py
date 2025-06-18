from app.models import db, User
from werkzeug.security import generate_password_hash

def seed_users():
    demo_users = [
        User(
            username="jane_doe",
            email="jane@example.com",
            role="guest",
            password=generate_password_hash("password123")
        ),
        User(
            username="podcaster123",
            email="podcast@example.com",
            role="host",
            password=generate_password_hash("letmein")
        )
    ]
    db.session.add_all(demo_users)
    db.session.commit()

def undo_users():
    db.session.execute("DELETE FROM users;")
    db.session.commit()
