from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Message, User
from app import socketio

message_routes = Blueprint("messages", __name__)

@message_routes.route("/<int:user_id>", methods=["GET"])
@login_required
def get_thread(user_id):
    try:
        thread = Message.query.filter(
            ((Message.sender_id    == current_user.id)   & (Message.recipient_id == user_id)) |
            ((Message.sender_id    == user_id)           & (Message.recipient_id == current_user.id))
        ).order_by(Message.created_at).all()
        return jsonify([m.to_dict() for m in thread]), 200

    except Exception:
        import traceback; traceback.print_exc()
        return jsonify({"error": "Server error loading thread"}), 500

@message_routes.route("", methods=["POST"])
@login_required
def post_message():
    try:
        data         = request.get_json(force=True) or {}
        recipient_id = data.get("recipient_id")
        body         = data.get("body")

        if not recipient_id or not body:
            return jsonify({"error": "Missing recipient_id or body"}), 400

        msg = Message(
            sender_id    = current_user.id,
            recipient_id = recipient_id,
            body         = body
        )
        db.session.add(msg)
        db.session.commit()

        # Broadcast new message to the recipient's room
        socketio.emit(
            "new_message",
            msg.to_dict(),
            room=str(recipient_id)
        )

        return jsonify(msg.to_dict()), 201

    except Exception:
        import traceback; traceback.print_exc()
        return jsonify({"error": "Server error sending message"}), 500

@message_routes.route("", methods=["GET"])
@login_required
def get_inbox():
    try:
        # grab all messages involving me, newest first
        msgs = Message.query.filter(
            (Message.sender_id    == current_user.id) |
            (Message.recipient_id == current_user.id)
        ).order_by(Message.created_at.desc()).all()

        # pick one latest message per conversation partner
        threads = {}
        for m in msgs:
            partner_id = m.recipient_id if m.sender_id == current_user.id else m.sender_id
            if partner_id not in threads:
                threads[partner_id] = m

        # build a simple JSON for each thread
        out = []
        for pid, msg in threads.items():
            user = User.query.get(pid)
            out.append({
                "user_id":      pid,
                "username":     user.username,
                "last_message": msg.body,
                "timestamp":    msg.created_at.isoformat()
            })

        return jsonify(out), 200

    except Exception:
        import traceback; traceback.print_exc()
        return jsonify({"error": "Server error loading inbox"}), 500
