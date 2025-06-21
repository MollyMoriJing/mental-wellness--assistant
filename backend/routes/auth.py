from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.user import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        token = create_access_token(identity=user.id)
        return jsonify(token=token)
    return jsonify({"error": "Invalid credentials"}), 401