# backend/app/socket_events.py

from flask_login import current_user
from flask_socketio import join_room, emit
from app import socketio

@socketio.on('join')
def handle_join(data):
    if not current_user.is_authenticated:
        return
    room = data.get('room')
    if room == str(current_user.id):
        join_room(room)

@socketio.on('typing')
def handle_typing(data):
    if not current_user.is_authenticated:
        return
    to_user = data.get('to')
    if to_user:
        emit('typing', {}, room=str(to_user), include_self=False)
