from flask import Flask
from flask_cors import CORS
from .models import db
from flask_login import LoginManager

login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'super-secret-key'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dev.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    login_manager.init_app(app)
    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

    # 🔐 Add this user_loader!
    from app.models import User
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    from app.api.auth_routes import auth_routes
    from app.api.user_routes import user_routes
    app.register_blueprint(auth_routes, url_prefix="/api/auth")
    app.register_blueprint(user_routes, url_prefix="/api/users")

    return app

