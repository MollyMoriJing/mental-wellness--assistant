from flask import Flask
from flask_jwt_extended import JWTManager
from app.utils.db import db

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    db.init_app(app)
    JWTManager(app)

    from app.routes.chat import chat_bp
    from app.routes.auth import auth_bp
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    return app
