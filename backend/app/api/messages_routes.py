from flask import Blueprint, request, jsonify, make_response
from flask_login import login_required, current_user
from app.models import db, Message, User

message_routes = Blueprint("messages", __name__)

# Preflight handler for CORS
@message_routes.route("/", methods=["OPTIONS"])
def handle_options():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    response.headers.add("Access-Control-Allow-Methods", "POST")
    return response

# Get message thread with another user
@message_routes.route("/<int:user_id>")
@login_required
def get_messages(user_id):
    messages = Message.query.filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == user_id)) |
        ((Message.sender_id == user_id) & (Message.receiver_id == current_user.id))
    ).order_by(Message.timestamp).all()

    return jsonify([{
        "id": msg.id,
        "from": msg.sender.username,
        "to": msg.receiver.username,
        "content": msg.content,
        "timestamp": msg.timestamp.isoformat()
    } for msg in messages])

# Send a message
@message_routes.route("/", methods=["POST"])
@login_required
def send_message():
    data = request.json
    new_msg = Message(
        sender_id=current_user.id,
        receiver_id=data["receiver_id"],
        content=data["content"]
    )
    db.session.add(new_msg)
    db.session.commit()
    return jsonify({
        "id": new_msg.id,
        "from": current_user.username,
        "to": User.query.get(data["receiver_id"]).username,
        "content": new_msg.content,
        "timestamp": new_msg.timestamp.isoformat()
    })
