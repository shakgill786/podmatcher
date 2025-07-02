# backend/app/api/messages_routes.py

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Message, User
from app import socketio

message_routes = Blueprint("messages", __name__)


@message_routes.route("/<int:user_id>", methods=["GET"])
@login_required
def get_thread(user_id):
    """Fetch one-on-one thread and mark incoming unread as read."""
    try:
        # 1) Mark any unread messages *to* me from user_id as read
        unread = Message.query.filter_by(
            sender_id=user_id,
            recipient_id=current_user.id,
            is_read=False
        ).all()
        for m in unread:
            m.is_read = True
        if unread:
            db.session.commit()

        # 2) Load full conversation (oldest→newest)
        thread = Message.query.filter(
            ((Message.sender_id    == current_user.id) & (Message.recipient_id == user_id)) |
            ((Message.sender_id    == user_id)           & (Message.recipient_id == current_user.id))
        ).order_by(Message.created_at).all()

        return jsonify([m.to_dict() for m in thread]), 200

    except Exception:
        import traceback; traceback.print_exc()
        return jsonify({"error": "Server error loading thread"}), 500


@message_routes.route("", methods=["POST"])
@login_required
def post_message():
    """Send a message, broadcast it to both parties, and update the recipient’s unread badge."""
    try:
        data         = request.get_json(force=True) or {}
        recipient_id = data.get("recipient_id")
        body         = data.get("body")

        if not recipient_id or not body:
            return jsonify({"error": "Missing recipient_id or body"}), 400

        # Create and save
        msg = Message(
            sender_id    = current_user.id,
            recipient_id = recipient_id,
            body         = body,
            is_read      = False
        )
        db.session.add(msg)
        db.session.commit()

        payload = msg.to_dict()

        # A) Broadcast to recipient
        socketio.emit("new_message", payload, room=str(recipient_id))
        # B) Also broadcast back to sender so they see it immediately
        socketio.emit("new_message", payload, room=str(current_user.id))

        # C) Recompute and broadcast the recipient’s total unread count
        unread_count = Message.query.filter_by(
            recipient_id=recipient_id,
            is_read=False
        ).count()
        socketio.emit(
            "unread_count",
            {"unread_count": unread_count},
            room=str(recipient_id)
        )

        return jsonify(payload), 201

    except Exception:
        import traceback; traceback.print_exc()
        return jsonify({"error": "Server error sending message"}), 500


@message_routes.route("", methods=["GET"])
@login_required
def get_inbox():
    """List latest thread per partner, with per-thread unread counts, sorted unread-first then newest."""
    try:
        # 1) Fetch all messages involving me, newest first
        msgs = Message.query.filter(
            (Message.sender_id    == current_user.id) |
            (Message.recipient_id == current_user.id)
        ).order_by(Message.created_at.desc()).all()

        # 2) Pick the latest message per partner
        threads = {}
        for m in msgs:
            partner_id = m.recipient_id if m.sender_id == current_user.id else m.sender_id
            if partner_id not in threads:
                threads[partner_id] = m

        # 3) Build the output
        out = []
        for pid, msg in threads.items():
            user = User.query.get(pid)
            unread = Message.query.filter_by(
                sender_id   = pid,
                recipient_id= current_user.id,
                is_read     = False
            ).count()
            out.append({
                "user_id":      pid,
                "username":     user.username,
                "last_message": msg.body,
                "timestamp":    msg.created_at.isoformat(),
                "unread_count": unread
            })

        # 4) Sort threads: any with unread_count>0 first, then by timestamp desc
        out.sort(
            key=lambda t: ((t["unread_count"] > 0), t["timestamp"]),
            reverse=True
        )
        return jsonify(out), 200

    except Exception:
        import traceback; traceback.print_exc()
        return jsonify({"error": "Server error loading inbox"}), 500


@message_routes.route("/unread_count", methods=["GET"])
@login_required
def get_unread_count():
    """Global badge: total number of unread messages for the current user."""
    count = Message.query.filter_by(
        recipient_id=current_user.id,
        is_read=False
    ).count()
    return jsonify({"unread_count": count}), 200
