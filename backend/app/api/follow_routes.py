# backend/app/api/follow_routes.py

from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from app.models import db, User

follow_routes = Blueprint("follows", __name__)

@follow_routes.route("/<int:user_id>/follow", methods=["POST"])
@login_required
def follow(user_id):
    """Current user follows user_id."""
    target = User.query.get(user_id)
    if not target:
        return jsonify({"error": "User not found"}), 404

    current_user.follow(target)
    db.session.commit()

    return jsonify({
        "followers_count": target.followers.count(),
        "following_count": current_user.followed.count()
    }), 200

@follow_routes.route("/<int:user_id>/unfollow", methods=["DELETE"])
@login_required
def unfollow(user_id):
    """Current user unfollows user_id."""
    target = User.query.get(user_id)
    if not target:
        return jsonify({"error": "User not found"}), 404

    current_user.unfollow(target)
    db.session.commit()

    return jsonify({
        "followers_count": target.followers.count(),
        "following_count": current_user.followed.count()
    }), 200

@follow_routes.route("/me/following", methods=["GET"])
@login_required
def get_following():
    """List all users the current user is following."""
    mates = current_user.followed.all()
    return jsonify([u.to_dict() for u in mates]), 200
