# backend/app/__init__.py

from flask import Flask
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_session import Session
from flask_wtf.csrf import CSRFProtect
from flask_cors import CORS
from flask_socketio import SocketIO
from app.models import db

# ─── Extension instances ────────────────────────────────────────────────────
login_manager = LoginManager()
csrf          = CSRFProtect()

# Create SocketIO instance at module scope
# so it can be imported by socket_events without circularity
socketio = SocketIO(
    cors_allowed_origins="http://localhost:5173",
    manage_session=False
)

# Immediately import your event handlers so they bind to `socketio`
import app.socket_events  # noqa: F401


def create_app():
    app = Flask(__name__)

    # ─── Config ─────────────────────────────────────────────────────────────
    app.config.update(
        SECRET_KEY='super-secret-key',
        SQLALCHEMY_DATABASE_URI='sqlite:///dev.db',
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SESSION_TYPE='filesystem',
        SESSION_PERMANENT=False,
        SESSION_COOKIE_SAMESITE='Lax',
        SESSION_COOKIE_SECURE=False,
        REMEMBER_COOKIE_SECURE=False,
        WTF_CSRF_CHECK_DEFAULT=False,
        SESSION_COOKIE_HTTPONLY=True,
    )

    # ─── Init extensions ─────────────────────────────────────────────────────
    db.init_app(app)
    Migrate(app, db)
    login_manager.init_app(app)
    Session(app)
    csrf.init_app(app)

    # Redirect unauthenticated users
    login_manager.login_view = 'auth.login'

    # ─── User loader ─────────────────────────────────────────────────────────
    from app.models import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # ─── CORS ────────────────────────────────────────────────────────────────
    CORS(
        app,
        supports_credentials=True,
        resources={
            r"/api/*": {
                "origins": ["http://localhost:5173"],
                "methods": ["GET","POST","PUT","DELETE","OPTIONS"],
                "allow_headers": ["Content-Type","X-CSRFToken"]
            },
            r"/static/*": {
                "origins": ["http://localhost:5173"]
            }
        },
    )

    # ─── Blueprints ─────────────────────────────────────────────────────────
    from app.api.auth_routes     import auth_routes
    from app.api.user_routes     import user_routes
    from app.api.messages_routes import message_routes
    from app.api.audio_routes    import audio_routes
    from app.api.csrf_routes     import csrf_routes

    app.register_blueprint(auth_routes,    url_prefix="/api/auth")
    app.register_blueprint(user_routes,    url_prefix="/api/users")
    app.register_blueprint(message_routes, url_prefix="/api/messages")
    app.register_blueprint(audio_routes,   url_prefix="/api/audio")
    app.register_blueprint(csrf_routes,    url_prefix="/api")

    # ─── Seed CLI ───────────────────────────────────────────────────────────
    from app.seeds.seed_commands import seed_commands
    app.cli.add_command(seed_commands)

    # ─── Wire up SocketIO ────────────────────────────────────────────────────
    socketio.init_app(app)

    return app
