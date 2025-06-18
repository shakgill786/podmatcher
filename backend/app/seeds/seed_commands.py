# backend/app/seeds/seed_commands.py

from flask.cli import AppGroup
from app.models import db, User
from sqlalchemy.sql import text
import click

seed_commands = AppGroup('seed')

@seed_commands.command('all')
def seed_all():
    click.echo('🌱 Seeding database...')
    
    # Clear existing data
    db.session.execute(text("DELETE FROM users"))
    db.session.commit()

    # Add users
    users = [
        User(username="shak", email="shak@example.com", role="host"),
        User(username="emma", email="emma@example.com", role="guest"),
        User(username="sehrish", email="sehrish@example.com", role="host"),
    ]
    for u in users:
        u.set_password("password123")
        db.session.add(u)
    db.session.commit()

    click.echo('✅ Seeded users!')
