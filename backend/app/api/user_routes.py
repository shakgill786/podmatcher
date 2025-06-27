from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from flask_wtf.csrf import validate_csrf
from app.models import db, User, followers

user_routes = Blueprint("users", __name__)

# — Existing endpoints —
@user_routes.route("/me", methods=["GET"])
@login_required
def get_current_user():
    return jsonify(current_user.to_dict()), 200

@user_routes.route("/me", methods=["PUT"])
@login_required
def update_current_user():
    csrf_token = request.headers.get("X-CSRFToken", "")
    try:
        validate_csrf(csrf_token)
    except:
        return jsonify({"error": "CSRF validation failed"}), 400

    data = request.get_json(force=True) or {}
    current_user.username  = data.get("username",  current_user.username)
    current_user.bio       = data.get("bio",       current_user.bio)
    current_user.interests = data.get("interests", current_user.interests)
    current_user.category  = data.get("category",  current_user.category)
    current_user.role      = data.get("role",      current_user.role)

    db.session.commit()
    return jsonify(current_user.to_dict()), 200

@user_routes.route("/", methods=["GET"])
@login_required
def get_all_users():
    users = User.query.filter(User.id != current_user.id).all()
    return jsonify([u.to_dict() for u in users]), 200

@user_routes.route("/<int:user_id>", methods=["GET"])
def get_user_by_id(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200

# — New “follow” endpoints — 

@user_routes.route("/<int:user_id>/follow", methods=["POST"])
@login_required
def follow_user(user_id):
    target = User.query.get_or_404(user_id)
    current_user.follow(target)
    db.session.commit()
    return jsonify({"message": f"You are now following {target.username}"}), 200

@user_routes.route("/<int:user_id>/unfollow", methods=["DELETE"])
@login_required
def unfollow_user(user_id):
    target = User.query.get_or_404(user_id)
    current_user.unfollow(target)
    db.session.commit()
    return jsonify({"message": f"You have unfollowed {target.username}"}), 200

@user_routes.route("/me/mates", methods=["GET"])
@login_required
def get_my_mates():
    mates = current_user.followed.all()
    return jsonify([u.to_dict() for u in mates]), 200
