# backend/app/socket_events.py

from flask_login import current_user, login_required
from flask_socketio import join_room, emit
from app import socketio

@socketio.on('join')
@login_required
def on_join(data):
    """Client tells us which room to join (their user ID)."""
    room = data.get('room')
    if room:
        join_room(room)

@socketio.on('typing')
@login_required
def on_typing(data):
    """Forward typing notification to the target user."""
    to_user = data.get('to')
    if to_user:
        emit('typing', {}, room=str(to_user), include_self=False)
