from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date, datetime
from backend.services.chat_service import generate_response
from backend.models.user import log_chat, db, ChatSession, ChatMessage

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    user_id = int(get_jwt_identity())
    payload = request.get_json() or {}
    message = payload.get('message', '')
    
    # Generate AI response
    reply = generate_response(user_id, message)
    
    # Get or create today's chat session
    today = date.today()
    session = ChatSession.query.filter_by(user_id=user_id, date=today).first()
    
    if not session:
        # Create new session for today
        session = ChatSession(
            user_id=user_id,
            title=f'Conversation - {today.strftime("%B %d, %Y")}',
            date=today
        )
        db.session.add(session)
        db.session.flush()  # Get the session ID
    
    # Save user message
    user_msg = ChatMessage(
        session_id=session.id,
        content=message,
        message_type='user'
    )
    db.session.add(user_msg)
    
    # Save bot response
    bot_msg = ChatMessage(
        session_id=session.id,
        content=reply,
        message_type='bot'
    )
    db.session.add(bot_msg)
    
    # Update session timestamp
    session.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    log_chat(user_id, message, reply)
    return jsonify({"response": reply})
