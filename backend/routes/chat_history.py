from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from backend.models.user import db, ChatSession, ChatMessage


chat_history_bp = Blueprint('chat_history', __name__)


@chat_history_bp.route('/chat/sessions', methods=['GET'])
@jwt_required()
def get_chat_sessions():
    """Get all chat sessions for the current user, grouped by date"""
    user_id = int(get_jwt_identity())

    # Get all sessions for the user, ordered by date (newest first)
    sessions = ChatSession.query.filter_by(
        user_id=user_id
    ).order_by(ChatSession.date.desc()).all()

    # Group sessions by date
    sessions_by_date = {}
    for session in sessions:
        date_str = session.date.isoformat()
        if date_str not in sessions_by_date:
            sessions_by_date[date_str] = {
                'date': date_str,
                'sessions': []
            }

        # Get message count for this session
        message_count = ChatMessage.query.filter_by(
            session_id=session.id
        ).count()

        sessions_by_date[date_str]['sessions'].append({
            'id': session.id,
            'title': session.title,
            'message_count': message_count,
            'created_at': session.created_at.isoformat(),
            'updated_at': session.updated_at.isoformat()
        })

    # Convert to list and sort by date
    result = list(sessions_by_date.values())
    result.sort(key=lambda x: x['date'], reverse=True)

    return jsonify(result)


@chat_history_bp.route('/chat/sessions/<int:session_id>', methods=['GET'])
@jwt_required()
def get_chat_session(session_id):
    """Get a specific chat session with all its messages"""
    user_id = int(get_jwt_identity())

    session = ChatSession.query.filter_by(
        id=session_id, user_id=user_id
    ).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404

    # Get all messages for this session
    messages = ChatMessage.query.filter_by(
        session_id=session_id
    ).order_by(ChatMessage.created_at.asc()).all()

    return jsonify({
        'id': session.id,
        'title': session.title,
        'date': session.date.isoformat(),
        'created_at': session.created_at.isoformat(),
        'updated_at': session.updated_at.isoformat(),
        'messages': [{
            'id': msg.id,
            'content': msg.content,
            'message_type': msg.message_type,
            'created_at': msg.created_at.isoformat()
        } for msg in messages]
    })


@chat_history_bp.route('/chat/sessions', methods=['POST'])
@jwt_required()
def create_chat_session():
    """Create a new chat session for today"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    today = date.today()
    title = data.get(
        'title', f'Conversation - {today.strftime("%B %d, %Y")}'
    )

    # Check if there's already a session for today
    existing_session = ChatSession.query.filter_by(
        user_id=user_id, date=today
    ).first()
    if existing_session:
        return jsonify({
            'id': existing_session.id,
            'title': existing_session.title,
            'date': existing_session.date.isoformat(),
            'created_at': existing_session.created_at.isoformat(),
            'updated_at': existing_session.updated_at.isoformat()
        })

    # Create new session
    session = ChatSession(
        user_id=user_id,
        title=title,
        date=today
    )

    db.session.add(session)
    db.session.commit()

    return jsonify({
        'id': session.id,
        'title': session.title,
        'date': session.date.isoformat(),
        'created_at': session.created_at.isoformat(),
        'updated_at': session.updated_at.isoformat()
    }), 201


@chat_history_bp.route('/chat/sessions/<int:session_id>/messages', methods=['POST'])
@jwt_required()
def add_chat_message(session_id):
    """Add a message to a chat session"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    # Verify session belongs to user
    session = ChatSession.query.filter_by(
        id=session_id, user_id=user_id
    ).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404

    content = data.get('content', '').strip()
    message_type = data.get('message_type', 'user')

    if not content:
        return jsonify({'error': 'Message content is required'}), 400

    # Create message
    message = ChatMessage(
        session_id=session_id,
        content=content,
        message_type=message_type
    )

    db.session.add(message)

    # Update session timestamp
    session.updated_at = datetime.utcnow()

    db.session.commit()

    return jsonify({
        'id': message.id,
        'content': message.content,
        'message_type': message.message_type,
        'created_at': message.created_at.isoformat()
    }), 201


@chat_history_bp.route('/chat/sessions/<int:session_id>', methods=['PUT'])
@jwt_required()
def update_chat_session(session_id):
    """Update a chat session title"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    session = ChatSession.query.filter_by(
        id=session_id, user_id=user_id
    ).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404

    if 'title' in data:
        session.title = data['title']
        session.updated_at = datetime.utcnow()
        db.session.commit()

    return jsonify({
        'id': session.id,
        'title': session.title,
        'date': session.date.isoformat(),
        'created_at': session.created_at.isoformat(),
        'updated_at': session.updated_at.isoformat()
    })


@chat_history_bp.route('/chat/sessions/<int:session_id>', methods=['DELETE'])
@jwt_required()
def delete_chat_session(session_id):
    """Delete a chat session and all its messages"""
    user_id = int(get_jwt_identity())

    session = ChatSession.query.filter_by(
        id=session_id, user_id=user_id
    ).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404

    db.session.delete(session)
    db.session.commit()

    return jsonify({'message': 'Session deleted successfully'})


@chat_history_bp.route('/chat/recent', methods=['GET'])
@jwt_required()
def get_recent_sessions():
    """Get recent chat sessions for dashboard"""
    user_id = int(get_jwt_identity())

    # Get last 5 sessions
    sessions = ChatSession.query.filter_by(
        user_id=user_id
    ).order_by(ChatSession.updated_at.desc()).limit(5).all()

    result = []
    for session in sessions:
        # Get message count
        message_count = ChatMessage.query.filter_by(
            session_id=session.id
        ).count()

        # Get last message preview
        last_message = ChatMessage.query.filter_by(
            session_id=session.id
        ).order_by(ChatMessage.created_at.desc()).first()
        last_message_preview = (
            last_message.content[:100] + '...'
            if last_message and len(last_message.content) > 100
            else (last_message.content if last_message else '')
        )

        result.append({
            'id': session.id,
            'title': session.title,
            'date': session.date.isoformat(),
            'message_count': message_count,
            'last_message_preview': last_message_preview,
            'updated_at': session.updated_at.isoformat()
        })

    return jsonify(result)
