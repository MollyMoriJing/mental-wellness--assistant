from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import db, MoodEntry

user_bp = Blueprint('user', __name__)

@user_bp.route('/user/moods', methods=['GET'])
@jwt_required()
def get_moods():
    user_id = get_jwt_identity()
    moods = MoodEntry.query.filter_by(user_id=user_id).order_by(MoodEntry.timestamp.desc()).all()
    return jsonify([
        {
            "level": mood.level,
            "note": mood.note,
            "timestamp": mood.timestamp.isoformat()
        } for mood in moods
    ])

@user_bp.route('/user/moods', methods=['POST'])
@jwt_required()
def log_mood():
    user_id = get_jwt_identity()
    data = request.get_json()
    mood = MoodEntry(user_id=user_id, level=data['level'], note=data.get('note'))
    db.session.add(mood)
    db.session.commit()
    return jsonify({"message": "Mood saved."})
