from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from flask_wtf.csrf import validate_csrf
from app.models import db, User

user_routes = Blueprint("users", __name__)

# ─── GET /api/users/me ─────────────────────────────
@user_routes.route("/me", methods=["GET"])
@login_required
def get_current_user():
    data = current_user.to_dict()
    data["is_following"] = False
    return jsonify(data), 200

# ─── PUT /api/users/me ─────────────────────────────
@user_routes.route("/me", methods=["PUT"])
@login_required
def update_current_user():
    csrf_token = request.headers.get("X-CSRFToken", "")
    try:
        validate_csrf(csrf_token)
    except:
        return jsonify({"error": "CSRF validation failed"}), 400

    payload = request.get_json(force=True) or {}
    current_user.username  = payload.get("username",  current_user.username)
    current_user.bio       = payload.get("bio",       current_user.bio)
    current_user.interests = payload.get("interests", current_user.interests)
    current_user.category  = payload.get("category",  current_user.category)
    current_user.role      = payload.get("role",      current_user.role)
    db.session.commit()

    data = current_user.to_dict()
    data["is_following"] = False
    return jsonify(data), 200

# ─── GET /api/users ────────────────────────────────
@user_routes.route("/", methods=["GET"])
@login_required
def get_all_users():
    users = User.query.filter(User.id != current_user.id).all()
    out = []
    for u in users:
        d = u.to_dict()
        d["is_following"] = current_user.is_following(u)
        out.append(d)
    return jsonify(out), 200

# ─── GET /api/users/<id> ───────────────────────────
@user_routes.route("/<int:user_id>", methods=["GET"])
def get_user_by_id(user_id):
    u = User.query.get(user_id)
    if not u:
        return jsonify({"error": "User not found"}), 404

    d = u.to_dict()
    d["is_following"] = False
    if current_user.is_authenticated:
        d["is_following"] = current_user.is_following(u)
    return jsonify(d), 200

# ─── POST /api/users/<id>/follow ───────────────────
@user_routes.route("/<int:user_id>/follow", methods=["POST"])
@login_required
def follow_user(user_id):
    target = User.query.get_or_404(user_id)
    current_user.follow(target)
    db.session.commit()
    return jsonify({
        "following_count": current_user.followed.count(),
        "followers_count": target.followers.count(),
        "is_following":    True
    }), 200

# ─── DELETE /api/users/<id>/follow ─────────────────
@user_routes.route("/<int:user_id>/unfollow", methods=["DELETE"])
@login_required
def unfollow_user(user_id):
    target = User.query.get_or_404(user_id)
    current_user.unfollow(target)
    db.session.commit()
    return jsonify({
        "following_count": current_user.followed.count(),
        "followers_count": target.followers.count(),
        "is_following":    False
    }), 200

# ─── GET /api/users/me/mates ───────────────────────
@user_routes.route("/me/mates", methods=["GET"])
@login_required
def get_my_mates():
    mates = current_user.followed.all()
    out = []
    for u in mates:
        d = u.to_dict()
        d["is_following"] = True
        out.append(d)
    return jsonify(out), 200
