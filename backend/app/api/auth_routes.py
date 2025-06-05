from flask import Blueprint, request, jsonify
from app.models import db, User
from app.forms.signup_form import SignupForm
from app.forms.login_form import LoginForm
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash
from sqlalchemy.exc import IntegrityError

auth_routes = Blueprint("auth", __name__)

@auth_routes.route("/signup", methods=["POST"])
def signup():
    form = SignupForm()
    form_data = request.get_json()

    form.username.data = form_data.get("username")
    form.email.data = form_data.get("email")
    form.password.data = form_data.get("password")
    form.role.data = form_data.get("role")

    if form.validate():
        try:
            user = User(
                username=form.username.data,
                email=form.email.data,
                role=form.role.data,
            )
            user.set_password(form.password.data)
            db.session.add(user)
            db.session.commit()
            login_user(user)
            return jsonify({"message": "Signup successful", "user": user.to_dict()}), 200
        except IntegrityError:
            db.session.rollback()
            return jsonify({"error": "Email already in use"}), 400
    else:
        print("❌ Signup form errors:", form.errors)
        return jsonify({"errors": form.errors}), 400

@auth_routes.route("/login", methods=["POST"])
def login():
    form = LoginForm()
    data = request.get_json()

    form.email.data = data.get("email")
    form.password.data = data.get("password")

    if form.validate():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            return jsonify({"message": "Login successful", "user": user.to_dict()}), 200
        return jsonify({"error": "Invalid credentials"}), 401
    else:
        print("❌ Login form errors:", form.errors)
        return jsonify({"errors": form.errors}), 400

@auth_routes.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

# ✅ NEW: Persistent login/auth check route
@auth_routes.route("/me", methods=["GET"])
def authenticate():
    print("Session check ➜", current_user.is_authenticated, current_user.get_id())
    if current_user.is_authenticated:
        return jsonify(current_user.to_dict()), 200
    return jsonify({"error": "Not authenticated"}), 401
