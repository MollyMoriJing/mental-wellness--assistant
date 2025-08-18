from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models.user import db, MoodEntry
from backend.utils.auth import get_embedding
from backend.utils.pinecone import upsert_embedding
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

user_bp = Blueprint('user', __name__)


@user_bp.route('/user/moods', methods=['GET'])
@jwt_required()
def get_moods():
    user_id = get_jwt_identity()
    moods = (
        MoodEntry.query.filter_by(user_id=user_id)
        .order_by(MoodEntry.timestamp.desc())
        .all()
    )
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
    data = request.get_json() or {}
    level = (data.get('level') or '').strip()
    note = (data.get('note') or '').strip()
    if not level:
        return jsonify({"error": "level is required"}), 400
    mood = MoodEntry(
        user_id=user_id,
        level=level,
        note=note or None
    )
    db.session.add(mood)
    db.session.commit()
    text = f"{mood.level or ''} | {mood.note or ''}".strip()
    if text:
        embedding = get_embedding(text)
        upsert_embedding(user_id, embedding, {"label": f"mood:{mood.id}", "text": text})
    return jsonify({"message": "Mood saved."})
