# backend/app/__init__.py

from flask_cors import CORS
from .models import db
from flask_login import LoginManager
from flask_migrate import Migrate

login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'super-secret-key'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dev.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    migrate = Migrate(app, db)
    login_manager.init_app(app)

    # 🔐 Load user from session
    from app.models import User
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # 🌐 Apply global CORS to the whole app
    CORS(app, supports_credentials=True, origins=[
        "http://localhost:5173", "http://127.0.0.1:5173"
    ])

    # Register Blueprints
    from app.api.auth_routes import auth_routes
    from app.api.user_routes import user_routes
    from app.api.messages_routes import message_routes

    app.register_blueprint(auth_routes, url_prefix="/api/auth")
    app.register_blueprint(user_routes, url_prefix="/api/users")
    app.register_blueprint(message_routes, url_prefix="/api/messages")

    return app
