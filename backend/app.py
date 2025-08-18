import os
import sys
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(CURRENT_DIR)
if PARENT_DIR not in sys.path:
    sys.path.append(PARENT_DIR)

from backend.models.user import db
from backend.routes.auth import auth_bp
from backend.routes.user import user_bp
from backend.routes.chat import chat_bp
from backend.config import Config
# flake8: noqa

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    CORS(app)
    JWTManager(app)
    Limiter(get_remote_address, app=app, default_limits=["60/minute", "1000/day"])

    @app.get('/api/health')
    def health():
        return {"status": "ok"}

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(chat_bp, url_prefix='/api')

    return app


if __name__ == '__main__':
    flask_app = create_app()
    with flask_app.app_context():
        db.create_all()
    flask_app.run(debug=True)

