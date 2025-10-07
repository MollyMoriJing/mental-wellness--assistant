from flask_socketio import emit, join_room, leave_room, disconnect
from flask_jwt_extended import decode_token
from backend.models.user import db, User, CoachingSession, CoachingMessage
from datetime import datetime
import os
from flask import request

# Store user sessions in memory (in production, use Redis)
user_sessions = {}

def get_user_session():
    """Get current user session data"""
    return user_sessions.get(request.sid, {})

def authenticate_user(token):
    """Authenticate user from JWT token"""
    try:
        decoded = decode_token(token)
        user_id = decoded['sub']
        user = User.query.get(user_id)
        return user
    except:
        return None

def register_handlers(socketio_instance):
    """Register all SocketIO event handlers"""
    global socketio
    socketio = socketio_instance
    
    @socketio.on('connect')
    def handle_connect(auth=None):
        """Handle client connection"""
        try:
            print(f"Connection attempt with auth: {auth}")
            
            if not auth or 'token' not in auth:
                print("No token provided, disconnecting")
                disconnect()
                return False
            
            user = authenticate_user(auth['token'])
            if not user:
                print("Invalid token, disconnecting")
                disconnect()
                return False
            
            # Store user info in session using request.sid
            user_sessions[request.sid] = {
                'user_id': user.id,
                'user_role': user.role,
                'is_coach': user.is_coach()
            }
            
            emit('connected', {
                'message': 'Connected successfully',
                'user_id': user.id,
                'display_name': user.display_name or user.email
            })
            
            print(f"User {user.id} connected successfully")
            return True
            
        except Exception as e:
            print(f"Error in connect handler: {e}")
            disconnect()
            return False

    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnection"""
        session_data = get_user_session()
        if session_data:
            user_id = session_data.get('user_id')
            print(f"User {user_id} disconnected")
            # Clean up session
            user_sessions.pop(request.sid, None)

    @socketio.on('join_coaching_session')
    def handle_join_coaching_session(data):
        """Join a coaching session room"""
        session_data = get_user_session()
        user_id = session_data.get('user_id')
        session_id = data.get('session_id')
        
        if not user_id or not session_id:
            emit('error', {'message': 'Invalid session'})
            return
        
        # Verify user has access to this session
        session = CoachingSession.query.get(session_id)
        if not session or (session.client_id != user_id and session.coach_id != user_id):
            emit('error', {'message': 'Unauthorized access to session'})
            return
        
        join_room(f'coaching_session_{session_id}')
        emit('joined_session', {
            'session_id': session_id,
            'message': 'Joined coaching session'
        })
        # notify others in the room for presence
        emit('user_joined_session', {
            'session_id': session_id,
            'user_id': user_id
        }, room=f'coaching_session_{session_id}', include_self=False)

    @socketio.on('leave_coaching_session')
    def handle_leave_coaching_session(data):
        """Leave a coaching session room"""
        session_id = data.get('session_id')
        if session_id:
            leave_room(f'coaching_session_{session_id}')
            emit('left_session', {
                'session_id': session_id,
                'message': 'Left coaching session'
            })
            session_data = get_user_session()
            emit('user_left_session', {
                'session_id': session_id,
                'user_id': session_data.get('user_id')
            }, room=f'coaching_session_{session_id}', include_self=False)

    @socketio.on('send_coaching_message')
    def handle_coaching_message(data):
        """Handle real-time coaching messages"""
        session_data = get_user_session()
        user_id = session_data.get('user_id')
        session_id = data.get('session_id')
        content = data.get('content')
        message_type = data.get('message_type', 'text')
        
        if not user_id or not session_id or not content:
            emit('error', {'message': 'Invalid message data'})
            return
        
        # Verify user has access to this session
        session = CoachingSession.query.get(session_id)
        if not session or (session.client_id != user_id and session.coach_id != user_id):
            emit('error', {'message': 'Unauthorized access to session'})
            return
        
        # Create message in database
        message = CoachingMessage(
            session_id=session_id,
            sender_id=user_id,
            content=content,
            message_type=message_type
        )
        
        db.session.add(message)
        db.session.commit()
        
        # Get sender info
        sender = User.query.get(user_id)
        
        # Broadcast message to all users in the session room
        emit('coaching_message', {
            'id': message.id,
            'content': content,
            'message_type': message_type,
            'created_at': message.created_at.isoformat(),
            'session_id': session_id,
            'sender': {
                'id': sender.id,
                'display_name': sender.display_name or sender.email,
                'is_coach': sender.is_coach()
            }
        }, room=f'coaching_session_{session_id}')

    @socketio.on('join_community')
    def handle_join_community():
        """Join the general community room"""
        session_data = get_user_session()
        user_id = session_data.get('user_id')
        if user_id:
            join_room('community')
            emit('joined_community', {
                'message': 'Joined community chat'
            })

    @socketio.on('leave_community')
    def handle_leave_community():
        """Leave the general community room"""
        leave_room('community')
        emit('left_community', {
            'message': 'Left community chat'
        })

    @socketio.on('send_community_message')
    def handle_community_message(data):
        """Handle community-wide messages"""
        session_data = get_user_session()
        user_id = session_data.get('user_id')
        content = data.get('content')
        
        if not user_id or not content:
            emit('error', {'message': 'Invalid message data'})
            return
        
        user = User.query.get(user_id)
        
        # Broadcast to all users in community room
        emit('community_message', {
            'content': content,
            'created_at': datetime.utcnow().isoformat(),
            'sender': {
                'id': user.id,
                'display_name': user.display_name or user.email,
                'is_coach': user.is_coach()
            }
        }, room='community')

    @socketio.on('typing_start')
    def handle_typing_start(data):
        """Handle typing indicator start"""
        session_data = get_user_session()
        user_id = session_data.get('user_id')
        session_id = data.get('session_id')
        
        if user_id and session_id:
            user = User.query.get(user_id)
            emit('user_typing', {
                'user_id': user_id,
                'display_name': user.display_name or user.email,
                'is_typing': True,
                'session_id': session_id
            }, room=f'coaching_session_{session_id}', include_self=False)

    @socketio.on('typing_stop')
    def handle_typing_stop(data):
        """Handle typing indicator stop"""
        session_data = get_user_session()
        user_id = session_data.get('user_id')
        session_id = data.get('session_id')
        
        if user_id and session_id:
            user = User.query.get(user_id)
            emit('user_typing', {
                'user_id': user_id,
                'display_name': user.display_name or user.email,
                'is_typing': False,
                'session_id': session_id
            }, room=f'coaching_session_{session_id}', include_self=False)

    @socketio.on('request_coach_availability')
    def handle_coach_availability_request(data):
        """Handle coach availability check"""
        session_data = get_user_session()
        user_id = session_data.get('user_id')
        coach_id = data.get('coach_id')
        
        if not user_id or not coach_id:
            emit('error', {'message': 'Invalid request'})
            return
        
        # Check if coach is online
        coach_rooms = socketio.server.manager.get_rooms()
        coach_online = any(f'user_{coach_id}' in room for room in coach_rooms)
        
        emit('coach_availability', {
            'coach_id': coach_id,
            'is_online': coach_online
        })

    @socketio.on('join_user_room')
    def handle_join_user_room():
        """Join user-specific room for notifications"""
        session_data = get_user_session()
        user_id = session_data.get('user_id')
        if user_id:
            join_room(f'user_{user_id}')
            emit('joined_user_room', {
                'message': 'Joined user notification room'
            })

    @socketio.on('send_notification')
    def handle_send_notification(data):
        """Send notification to specific user"""
        session_data = get_user_session()
        user_id = session_data.get('user_id')
        target_user_id = data.get('target_user_id')
        message = data.get('message')
        notification_type = data.get('type', 'info')
        
        # Only coaches and admins can send notifications
        session_data = get_user_session()
        if not session_data.get('is_coach') and session_data.get('user_role') != 'admin':
            emit('error', {'message': 'Unauthorized'})
            return
        
        if user_id and target_user_id and message:
            emit('notification', {
                'message': message,
                'type': notification_type,
                'from_user_id': user_id,
                'created_at': datetime.utcnow().isoformat()
            }, room=f'user_{target_user_id}')