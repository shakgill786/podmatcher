# backend/app/__init__.py

from flask import Flask
from flask_cors import CORS
from flask_session import Session
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from app.models import db
from flask import session

login_manager = LoginManager()
csrf = CSRFProtect()

def create_app():
    app = Flask(__name__)

    # 🔐 Config
    app.config['SECRET_KEY'] = 'super-secret-key'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dev.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False  # ❗ False for localhost
    app.config['REMEMBER_COOKIE_SECURE'] = False
    app.config['WTF_CSRF_CHECK_DEFAULT'] = False  # Manually handled
    app.config['SESSION_COOKIE_HTTPONLY'] = True

    # 🔌 Init
    db.init_app(app)
    Migrate(app, db)
    login_manager.init_app(app)
    Session(app)
    csrf.init_app(app)

    # 👤 Load user
    from app.models import User
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # 🌐 CORS for frontend
    CORS(app, supports_credentials=True, origins=[
        "http://localhost:5173", "http://127.0.0.1:5173"
    ])

    # 📦 Blueprints
    from app.api.auth_routes import auth_routes
    from app.api.user_routes import user_routes
    from app.api.messages_routes import message_routes
    from app.api.csrf_routes import csrf_routes

    app.register_blueprint(auth_routes, url_prefix="/api/auth")
    app.register_blueprint(user_routes, url_prefix="/api/users")
    app.register_blueprint(message_routes, url_prefix="/api/messages")
    app.register_blueprint(csrf_routes, url_prefix="/api")

    return app
