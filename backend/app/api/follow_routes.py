from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from app.models import db, User

follow_routes = Blueprint("follows", __name__)

@follow_routes.route("/<int:user_id>/follow", methods=["POST"])
@login_required
def follow(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    current_user.follow(user)
    db.session.commit()
    return jsonify({"following_count": current_user.followed.count(),
                    "followers_count": user.followers.count()}), 200

@follow_routes.route("/<int:user_id>/unfollow", methods=["DELETE"])
@login_required
def unfollow(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    current_user.unfollow(user)
    db.session.commit()
    return jsonify({"following_count": current_user.followed.count(),
                    "followers_count": user.followers.count()}), 200

@follow_routes.route("/me/following", methods=["GET"])
@login_required
def get_following():
    return jsonify([u.to_dict() for u in current_user.followed.all()]), 200
