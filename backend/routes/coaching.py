from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models.user import db, User, CoachingSession, CoachingMessage
from datetime import datetime

coaching_bp = Blueprint('coaching', __name__)

# Get available coaches
@coaching_bp.route('/coaching/coaches', methods=['GET'])
@jwt_required()
def get_coaches():
    coaches = User.query.filter_by(is_verified_coach=True).all()
    
    return jsonify([{
        'id': coach.id,
        'display_name': coach.display_name or coach.email,
        'bio': coach.bio,
        'role': coach.role,
        'created_at': coach.created_at.isoformat()
    } for coach in coaches])

# Request coaching session
@coaching_bp.route('/coaching/sessions', methods=['POST'])
@jwt_required()
def create_coaching_session():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # Verify coach exists and is verified
    coach = User.query.filter_by(id=data['coach_id'], is_verified_coach=True).first()
    if not coach:
        return jsonify({'error': 'Coach not found or not verified'}), 404
    
    session = CoachingSession(
        client_id=user_id,
        coach_id=data['coach_id'],
        title=data['title'],
        description=data.get('description'),
        scheduled_at=datetime.fromisoformat(data['scheduled_at']) if data.get('scheduled_at') else None,
        duration_minutes=data.get('duration_minutes', 60)
    )
    
    db.session.add(session)
    db.session.commit()
    
    return jsonify({
        'id': session.id,
        'message': 'Coaching session requested successfully'
    }), 201

# Get user's coaching sessions
@coaching_bp.route('/coaching/sessions', methods=['GET'])
@jwt_required()
def get_coaching_sessions():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.is_coach():
        # If user is a coach, get sessions where they are the coach
        sessions = CoachingSession.query.filter_by(coach_id=user_id).order_by(CoachingSession.created_at.desc()).all()
    else:
        # If user is a client, get sessions where they are the client
        sessions = CoachingSession.query.filter_by(client_id=user_id).order_by(CoachingSession.created_at.desc()).all()
    
    return jsonify([{
        'id': session.id,
        'title': session.title,
        'description': session.description,
        'status': session.status,
        'scheduled_at': session.scheduled_at.isoformat() if session.scheduled_at else None,
        'duration_minutes': session.duration_minutes,
        'notes': session.notes,
        'created_at': session.created_at.isoformat(),
        'client': {
            'id': session.client.id,
            'display_name': session.client.display_name or session.client.email
        },
        'coach': {
            'id': session.coach.id,
            'display_name': session.coach.display_name or session.coach.email
        }
    } for session in sessions])

# Get specific coaching session
@coaching_bp.route('/coaching/sessions/<int:session_id>', methods=['GET'])
@jwt_required()
def get_coaching_session(session_id):
    user_id = int(get_jwt_identity())
    session = CoachingSession.query.get_or_404(session_id)
    
    # Check if user is either client or coach
    if session.client_id != user_id and session.coach_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify({
        'id': session.id,
        'title': session.title,
        'description': session.description,
        'status': session.status,
        'scheduled_at': session.scheduled_at.isoformat() if session.scheduled_at else None,
        'duration_minutes': session.duration_minutes,
        'notes': session.notes,
        'created_at': session.created_at.isoformat(),
        'client': {
            'id': session.client.id,
            'display_name': session.client.display_name or session.client.email
        },
        'coach': {
            'id': session.coach.id,
            'display_name': session.coach.display_name or session.coach.email
        },
        'messages': [{
            'id': msg.id,
            'content': msg.content,
            'message_type': msg.message_type,
            'created_at': msg.created_at.isoformat(),
            'sender': {
                'id': msg.sender.id,
                'display_name': msg.sender.display_name or msg.sender.email,
                'is_coach': msg.sender.is_coach()
            }
        } for msg in session.messages.order_by(CoachingMessage.created_at.asc())]
    })

# Update coaching session (coach or client with limited permissions)
@coaching_bp.route('/coaching/sessions/<int:session_id>', methods=['PUT'])
@jwt_required()
def update_coaching_session(session_id):
    user_id = int(get_jwt_identity())
    session = CoachingSession.query.get_or_404(session_id)

    data = request.get_json()

    # Coach updates: can accept/reject/complete, add notes, reschedule
    if session.coach_id == user_id:
        if 'status' in data:
            session.status = data['status']
        if 'notes' in data:
            session.notes = data['notes']
        if data.get('scheduled_at'):
            session.scheduled_at = datetime.fromisoformat(data['scheduled_at'])
        if 'title' in data:
            session.title = data['title']
        if 'description' in data:
            session.description = data['description']
        session.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'Session updated successfully (coach)'}), 200

    # Client updates: can edit title/description/scheduled_at and cancel
    if session.client_id == user_id:
        if data.get('status') == 'cancelled':
            session.status = 'cancelled'
        if 'title' in data:
            session.title = data['title']
        if 'description' in data:
            session.description = data['description']
        if data.get('scheduled_at'):
            session.scheduled_at = datetime.fromisoformat(data['scheduled_at'])
        session.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'Session updated successfully (client)'}), 200

    return jsonify({'error': 'Unauthorized'}), 403

# Delete coaching session (client or coach)
@coaching_bp.route('/coaching/sessions/<int:session_id>', methods=['DELETE'])
@jwt_required()
def delete_coaching_session(session_id):
    user_id = int(get_jwt_identity())
    session = CoachingSession.query.get_or_404(session_id)
    
    if session.client_id != user_id and session.coach_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(session)
    db.session.commit()
    return jsonify({'message': 'Session deleted successfully'})

# Send message in coaching session
@coaching_bp.route('/coaching/sessions/<int:session_id>/messages', methods=['POST'])
@jwt_required()
def send_coaching_message(session_id):
    user_id = int(get_jwt_identity())
    session = CoachingSession.query.get_or_404(session_id)
    
    # Check if user is either client or coach
    if session.client_id != user_id and session.coach_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    message = CoachingMessage(
        session_id=session_id,
        sender_id=user_id,
        content=data['content'],
        message_type=data.get('message_type', 'text')
    )
    
    db.session.add(message)
    db.session.commit()
    
    return jsonify({
        'id': message.id,
        'message': 'Message sent successfully'
    }), 201

# Apply to become a coach
@coaching_bp.route('/coaching/apply', methods=['POST'])
@jwt_required()
def apply_to_be_coach():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    data = request.get_json()
    user.role = 'coach'
    user.display_name = data.get('display_name', user.email)
    user.bio = data.get('bio', '')
    # Note: is_verified_coach remains False until admin approval
    
    db.session.commit()
    
    return jsonify({'message': 'Application submitted successfully. Awaiting admin approval.'})

# Admin: Approve coach
@coaching_bp.route('/coaching/approve/<int:coach_id>', methods=['POST'])
@jwt_required()
def approve_coach(coach_id):
    user_id = int(get_jwt_identity())
    admin = User.query.get(user_id)
    
    if not admin.is_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    coach = User.query.get_or_404(coach_id)
    coach.is_verified_coach = True
    coach.role = 'coach'
    
    db.session.commit()
    
    return jsonify({'message': 'Coach approved successfully'})

# Admin: Get pending coach applications
@coaching_bp.route('/coaching/pending', methods=['GET'])
@jwt_required()
def get_pending_coaches():
    user_id = int(get_jwt_identity())
    admin = User.query.get(user_id)
    
    if not admin.is_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    pending_coaches = User.query.filter_by(role='coach', is_verified_coach=False).all()
    
    return jsonify([{
        'id': coach.id,
        'email': coach.email,
        'display_name': coach.display_name,
        'bio': coach.bio,
        'created_at': coach.created_at.isoformat()
    } for coach in pending_coaches])
