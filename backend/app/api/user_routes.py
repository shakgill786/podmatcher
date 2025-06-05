from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db, User

user_routes = Blueprint("users", __name__)

# 🔍 GET current user's profile
@user_routes.route("/me", methods=["GET"])
@login_required
def get_current_user():
    return jsonify(current_user.to_dict()), 200

# ✏️ PUT update current user's profile
@user_routes.route("/me", methods=["PUT"])
@login_required
def update_current_user():
    data = request.get_json()
    current_user.username = data.get("username", current_user.username)
    current_user.bio = data.get("bio", current_user.bio)
    current_user.category = data.get("category", current_user.category)
    current_user.role = data.get("role", current_user.role)
    current_user.interests = data.get("interests", current_user.interests)
    db.session.commit()
    return jsonify(current_user.to_dict()), 200

# 🌍 GET public profile by user ID (for PublicProfile.jsx)
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
