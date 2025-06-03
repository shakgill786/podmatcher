from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db, User

user_routes = Blueprint("users", __name__)

@user_routes.route("/me", methods=["GET"])
@login_required
def get_current_user():
    return jsonify(current_user.to_dict()), 200

@user_routes.route("/me", methods=["PUT"])
@login_required
def update_current_user():
    data = request.get_json()
    current_user.username = data.get("username", current_user.username)
    current_user.bio = data.get("bio", current_user.bio)
    current_user.category = data.get("category", current_user.category)
    current_user.role = data.get("role", current_user.role)
    db.session.commit()
    return jsonify(current_user.to_dict()), 200
