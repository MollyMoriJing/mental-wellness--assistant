from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.chat_service import generate_response
from models.user import log_chat

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    user_id = get_jwt_identity()
    message = request.json.get('message')
    reply = generate_response(message)
    log_chat(user_id, message, reply)
    return jsonify({"response": reply})