from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models.user import db, MoodEntry, User
from backend.utils.pinecone import upsert_embedding
from backend.utils.auth import get_embedding
import os

user_bp = Blueprint('user', __name__)

@user_bp.route('/user/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'email': user.email,
        'display_name': user.display_name or user.email,
        'role': user.role,
        'is_verified_coach': user.is_verified_coach,
        'bio': user.bio,
        'created_at': user.created_at.isoformat()
    })


@user_bp.route('/user/moods', methods=['GET'])
@jwt_required()
def get_moods():
    user_id = int(get_jwt_identity())
    moods = (
        MoodEntry.query.filter_by(user_id=user_id)
        .order_by(MoodEntry.timestamp.desc())
        .all()
    )
    return jsonify([
        {
            "id": mood.id,
            "level": mood.level,
            "note": mood.note,
            "timestamp": mood.timestamp.isoformat()
        } for mood in moods
    ])


@user_bp.route('/user/moods', methods=['POST'])
@jwt_required()
def log_mood():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    mood = MoodEntry(
        user_id=user_id,
        level=data['level'],
        note=data.get('note')
    )
    db.session.add(mood)
    db.session.commit()
    
    # Store in Pinecone for personalized chat responses
    try:
        if mood.note:  # Only index if there's a note
            # Create text content for embedding
            mood_text = f"Mood: {mood.level}. Note: {mood.note}"
            embedding = get_embedding(mood_text)
            
            metadata = {
                "text": mood_text,
                "level": mood.level,
                "note": mood.note,
                "timestamp": mood.timestamp.isoformat(),
                "user_id": user_id,
                "mood_id": mood.id
            }
            
            # Store in Pinecone with mood ID as vector ID
            upsert_embedding(user_id, embedding, metadata)
            print(f"Stored mood entry {mood.id} in Pinecone for user {user_id}")
        else:
            print(f"Mood entry {mood.id} has no note, skipping Pinecone storage")
    except Exception as e:
        print(f"Error storing mood in Pinecone: {e}")
        # Don't fail the request if Pinecone storage fails
    
    return jsonify({"message": "Mood saved."})


@user_bp.route('/user/moods/<int:mood_id>', methods=['PUT'])
@jwt_required()
def update_mood(mood_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    mood = MoodEntry.query.filter_by(id=mood_id, user_id=user_id).first()
    if not mood:
        return jsonify({"error": "Mood entry not found"}), 404
    
    mood.level = data['level']
    mood.note = data.get('note')
    db.session.commit()
    
    # Update in Pinecone
    try:
        if mood.note:
            mood_text = f"Mood: {mood.level}. Note: {mood.note}"
            embedding = get_embedding(mood_text)
            
            metadata = {
                "text": mood_text,
                "level": mood.level,
                "note": mood.note,
                "timestamp": mood.timestamp.isoformat(),
                "user_id": user_id,
                "mood_id": mood.id
            }
            
            upsert_embedding(user_id, embedding, metadata)
            print(f"Updated mood entry {mood.id} in Pinecone for user {user_id}")
    except Exception as e:
        print(f"Error updating mood in Pinecone: {e}")
    
    return jsonify({"message": "Mood updated."})


@user_bp.route('/user/moods/<int:mood_id>', methods=['DELETE'])
@jwt_required()
def delete_mood(mood_id):
    user_id = int(get_jwt_identity())
    
    mood = MoodEntry.query.filter_by(id=mood_id, user_id=user_id).first()
    if not mood:
        return jsonify({"error": "Mood entry not found"}), 404
    
    db.session.delete(mood)
    db.session.commit()
    
    return jsonify({"message": "Mood deleted."})


@user_bp.route('/user/pinecone-status', methods=['GET'])
@jwt_required()
def pinecone_status():
    """Check Pinecone status and stored vectors for debugging"""
    user_id = int(get_jwt_identity())
    
    try:
        from backend.utils.pinecone import pinecone_initialized, index, _namespace_for_user
        from backend.utils.auth import get_embedding
        
        status = {
            "pinecone_initialized": pinecone_initialized,
            "has_index": index is not None,
            "user_namespace": f"user-{user_id}",
            "openai_available": bool(os.getenv("OPENAI_API_KEY")),
            "pinecone_available": bool(os.getenv("PINECONE_API_KEY"))
        }
        
        if pinecone_initialized and index:
            try:
                ns = _namespace_for_user(user_id)
                # Get stats for the user's namespace
                stats = index.describe_index_stats()
                status["total_vectors"] = stats.get("total_vector_count", 0)
                status["namespaces"] = list(stats.get("namespaces", {}).keys())
            except Exception as e:
                status["error"] = str(e)
        
        return jsonify(status)
    except Exception as e:
        return jsonify({"error": str(e)})
