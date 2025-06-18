# app/api/user_routes.py

from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from flask_wtf.csrf import validate_csrf
from app.models import db, User

user_routes = Blueprint("users", __name__)

# 🔍 GET current user's profile
@user_routes.route("/me", methods=["GET"])
@login_required
def get_current_user():
    return jsonify(current_user.to_dict()), 200

# ✏️ PUT update current user's profile (with CSRF validation)
@user_routes.route("/me", methods=["PUT"])
@login_required
def update_current_user():
    try:
        csrf_token = request.headers.get("X-CSRFToken")
        validate_csrf(csrf_token)
    except Exception as e:
        print("❌ CSRF validation failed:", e)
        return jsonify({"error": "CSRF validation failed"}), 400

    try:
        data = request.get_json(force=True)
        print("📥 Incoming PUT /users/me:", data)
    except Exception as e:
        print("❌ JSON parsing failed in PUT /users/me:", e)
        return jsonify({"error": "Invalid JSON"}), 400

    try:
        current_user.username = data.get("username", current_user.username)
        current_user.bio = data.get("bio", current_user.bio)
        current_user.category = data.get("category", current_user.category)
        current_user.role = data.get("role", current_user.role)
        current_user.interests = data.get("interests", current_user.interests)

        db.session.commit()
        return jsonify(current_user.to_dict()), 200
    except Exception as e:
        print("❌ Failed to update user:", e)
        db.session.rollback()
        return jsonify({"error": "Database error"}), 500

# 🌍 GET public profile by user ID
@user_routes.route("/<int:user_id>", methods=["GET"])
def get_user_by_id(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "bio": user.bio,
        "interests": user.interests,
        "audio_file": user.audio_file,
        "category": user.category,
        "role": user.role
    }), 200

# 🧑‍🤝‍🧑 GET all users except current
@user_routes.route("/", methods=["GET"])
@login_required
def get_all_users():
    users = User.query.filter(User.id != current_user.id).all()
    return jsonify([user.to_dict() for user in users])
