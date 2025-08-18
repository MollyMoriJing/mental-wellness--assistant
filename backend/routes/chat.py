from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.services.chat_service import generate_response
from backend.models.user import log_chat
from openai.error import OpenAIError

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    user_id = get_jwt_identity()
    payload = request.get_json() or {}
    message = (payload.get('message') or '').strip()
    if not message:
        return jsonify({"error": "message is required"}), 400
    try:
        reply = generate_response(user_id, message)
    except OpenAIError:
        reply = (
            "I can't reach the language model right now. Your well-being matters. "
            "If you need immediate support, consider contacting local crisis resources."
        )
    log_chat(user_id, message, reply)
    return jsonify({"response": reply})
