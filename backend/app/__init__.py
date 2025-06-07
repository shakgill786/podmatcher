from flask import Flask
from flask_cors import CORS
from flask_session import Session
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect

from .models import db

login_manager = LoginManager()

def create_app():
    app = Flask(__name__)

    # 🔐 Core config
    app.config['SECRET_KEY'] = 'super-secret-key'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dev.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # ✅ Required for cookie-based login across origins
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False  # True only in production with HTTPS
    app.config['SESSION_TYPE'] = 'filesystem'

    # 🔌 Init extensions
    db.init_app(app)
    Migrate(app, db)
    login_manager.init_app(app)
    Session(app)
    CSRFProtect(app)  # Enables CSRF generation

    # 🔐 Load user from session
    from app.models import User
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # 🌐 Global CORS for frontend dev
    CORS(app, supports_credentials=True, origins=[
        "http://localhost:5173", "http://127.0.0.1:5173"
    ])

    # 🔗 Register Blueprints
    from app.api.auth_routes import auth_routes
    from app.api.user_routes import user_routes
    from app.api.messages_routes import message_routes
    from app.api.csrf_routes import csrf_routes  # ✅ NEW

    app.register_blueprint(auth_routes, url_prefix="/api/auth")
    app.register_blueprint(user_routes, url_prefix="/api/users")
    app.register_blueprint(message_routes, url_prefix="/api/messages")
    app.register_blueprint(csrf_routes, url_prefix="/api")  # ✅ NEW

    return app
