# backend/app/models/message.py

from . import db
from datetime import datetime

class Message(db.Model):
    __tablename__ = 'messages'

    id           = db.Column(db.Integer, primary_key=True)
    sender_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    body         = db.Column(db.Text, nullable=False)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

    # relationships to pull usernames easily
    sender    = db.relationship('User', foreign_keys=[sender_id])
    recipient = db.relationship('User', foreign_keys=[recipient_id])

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'body': self.body,
            'created_at': self.created_at.isoformat(),
            # for your frontend convenience:
            'from': self.sender.username,
            'timestamp': self.created_at.isoformat()
        }
