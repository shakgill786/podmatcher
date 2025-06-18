from flask import Blueprint, request, jsonify, make_response, session
from app.models import db, User
from app.forms.signup_form import SignupForm
from flask_login import login_user, logout_user, login_required, current_user
from flask_wtf.csrf import generate_csrf
from sqlalchemy.exc import IntegrityError

auth_routes = Blueprint("auth", __name__)

# ✅ SIGNUP
@auth_routes.route("/signup", methods=["POST"])
def signup():
    form = SignupForm()

    form.username.data = request.json.get("username")
    form.email.data = request.json.get("email")
    form.password.data = request.json.get("password")
    form.role.data = request.json.get("role", "guest")

    if not form.validate():
        return jsonify({"error": "Validation failed", "details": form.errors}), 400

    try:
        user = User(
            username=form.username.data,
            email=form.email.data,
            role=form.role.data
        )
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        login_user(user)

        response = jsonify({
            "message": "Signup successful",
            "user": user.to_dict()
        })
        response.set_cookie("csrf_token", generate_csrf(), samesite="Lax", secure=False)
        return response
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already in use"}), 400

# ✅ LOGIN
@auth_routes.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({"error": "Invalid JSON"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        login_user(user)
        response = jsonify({
            "message": "Login successful",
            "user": user.to_dict()
        })
        response.set_cookie("csrf_token", generate_csrf(), samesite="Lax", secure=False)
        return response

    return jsonify({"error": "Invalid credentials"}), 401

# ✅ LOGOUT
@auth_routes.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

# ✅ WHO AM I
@auth_routes.route("/me", methods=["GET"])
def authenticate():
    if current_user.is_authenticated:
        return jsonify(current_user.to_dict()), 200
    return jsonify({"error": "Not authenticated"}), 401

# ✅ CSRF RESTORE
@auth_routes.route("/csrf/restore", methods=["GET"])
def restore_csrf():
    response = make_response(jsonify({"message": "CSRF token set"}))
    response.set_cookie("csrf_token", generate_csrf(), samesite="Lax", secure=False)
    return response
