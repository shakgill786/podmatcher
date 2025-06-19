# backend/app/api/user_routes.py

from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from flask_wtf.csrf import validate_csrf
from app.models import db, User

# ⚠️ Removed strict_slashes here
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
    # 1️⃣ CSRF
    csrf_token = request.headers.get("X-CSRFToken", "")
    try:
        validate_csrf(csrf_token)
    except Exception as e:
        print("❌ CSRF failed:", e)
        return jsonify({"error": "CSRF validation failed"}), 400

    # 2️⃣ JSON body
    try:
        data = request.get_json(force=True)
    except Exception as e:
        print("❌ JSON parse failed:", e)
        return jsonify({"error": "Invalid JSON"}), 400

    # 3️⃣ Update
    try:
        current_user.username  = data.get("username",  current_user.username)
        current_user.bio       = data.get("bio",       current_user.bio)
        current_user.interests = data.get("interests", current_user.interests)
        current_user.category  = data.get("category",  current_user.category)
        current_user.role      = data.get("role",      current_user.role)

        db.session.commit()
        return jsonify(current_user.to_dict()), 200
    except Exception as e:
        print("❌ DB commit failed:", e)
        db.session.rollback()
        return jsonify({"error": "Database error"}), 500

# 🧑‍🤝‍🧑 GET all other users
@user_routes.route("/", methods=["GET"])
@login_required
def get_all_users():
    users = User.query.filter(User.id != current_user.id).all()
    return jsonify([u.to_dict() for u in users]), 200

# 🌍 GET public profile by user ID
@user_routes.route("/<int:user_id>", methods=["GET"])
def get_user_by_id(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200
