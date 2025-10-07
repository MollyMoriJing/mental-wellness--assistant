from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models.user import db, User, CommunityPost, PostComment, PostLike, CommentLike
from datetime import datetime

community_bp = Blueprint('community', __name__)

# Community Posts
@community_bp.route('/community/posts', methods=['GET'])
@jwt_required()
def get_posts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category = request.args.get('category', 'all')
    sort_by = request.args.get('sort', 'latest')  # latest, most_liked, most_commented
    
    query = CommunityPost.query
    
    if category != 'all':
        query = query.filter_by(category=category)
    
    # Apply sorting
    if sort_by == 'latest':
        query = query.order_by(CommunityPost.created_at.desc())
    elif sort_by == 'most_liked':
        query = query.order_by(CommunityPost.likes_count.desc(), CommunityPost.created_at.desc())
    elif sort_by == 'most_commented':
        query = query.order_by(CommunityPost.comments_count.desc(), CommunityPost.created_at.desc())
    else:
        query = query.order_by(CommunityPost.created_at.desc())
    
    posts = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'posts': [{
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'category': post.category,
            'is_anonymous': post.is_anonymous,
            'likes_count': post.likes_count,
            'comments_count': post.comments_count,
            'created_at': post.created_at.isoformat(),
            'author': {
                'id': post.user.id,
                'display_name': post.user.display_name or 'Anonymous',
                'is_coach': post.user.is_coach()
            } if not post.is_anonymous else None
        } for post in posts.items],
        'total': posts.total,
        'pages': posts.pages,
        'current_page': page
    })

@community_bp.route('/community/posts', methods=['POST'])
@jwt_required()
def create_post():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    post = CommunityPost(
        user_id=user_id,
        title=data['title'],
        content=data['content'],
        category=data.get('category', 'general'),
        is_anonymous=data.get('is_anonymous', False)
    )
    
    db.session.add(post)
    db.session.commit()
    
    return jsonify({
        'id': post.id,
        'message': 'Post created successfully'
    }), 201

@community_bp.route('/community/posts/<int:post_id>', methods=['GET'])
@jwt_required()
def get_post(post_id):
    post = CommunityPost.query.get_or_404(post_id)
    
    return jsonify({
        'id': post.id,
        'title': post.title,
        'content': post.content,
        'category': post.category,
        'is_anonymous': post.is_anonymous,
        'likes_count': post.likes_count,
        'comments_count': post.comments_count,
        'created_at': post.created_at.isoformat(),
        'author': {
            'id': post.user.id,
            'display_name': post.user.display_name or 'Anonymous',
            'is_coach': post.user.is_coach()
        } if not post.is_anonymous else None,
        'comments': [{
            'id': comment.id,
            'content': comment.content,
            'likes_count': comment.likes_count,
            'created_at': comment.created_at.isoformat(),
            'author': {
                'id': comment.user.id,
                'display_name': comment.user.display_name or 'Anonymous',
                'is_coach': comment.user.is_coach()
            },
            'replies': [{
                'id': reply.id,
                'content': reply.content,
                'likes_count': reply.likes_count,
                'created_at': reply.created_at.isoformat(),
                'author': {
                    'id': reply.user.id,
                    'display_name': reply.user.display_name or 'Anonymous',
                    'is_coach': reply.user.is_coach()
                }
            } for reply in comment.replies]
        } for comment in sorted([c for c in post.comments if c.parent_id is None], key=lambda x: x.created_at)]
    })

@community_bp.route('/community/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    user_id = int(get_jwt_identity())
    post = CommunityPost.query.get_or_404(post_id)
    
    if post.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    post.title = data.get('title', post.title)
    post.content = data.get('content', post.content)
    post.category = data.get('category', post.category)
    post.updated_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify({'message': 'Post updated successfully'})

@community_bp.route('/community/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    user_id = int(get_jwt_identity())
    post = CommunityPost.query.get_or_404(post_id)
    
    if post.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Post deleted successfully'})

# Post Likes
@community_bp.route('/community/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    user_id = int(get_jwt_identity())
    
    # Check if already liked
    existing_like = PostLike.query.filter_by(post_id=post_id, user_id=user_id).first()
    if existing_like:
        return jsonify({'message': 'Post already liked'}), 400
    
    like = PostLike(post_id=post_id, user_id=user_id)
    db.session.add(like)
    
    # Update likes count
    post = CommunityPost.query.get(post_id)
    post.likes_count += 1
    
    db.session.commit()
    return jsonify({'message': 'Post liked successfully'})

@community_bp.route('/community/posts/<int:post_id>/like', methods=['DELETE'])
@jwt_required()
def unlike_post(post_id):
    user_id = int(get_jwt_identity())
    
    like = PostLike.query.filter_by(post_id=post_id, user_id=user_id).first()
    if not like:
        return jsonify({'message': 'Post not liked'}), 400
    
    db.session.delete(like)
    
    # Update likes count
    post = CommunityPost.query.get(post_id)
    post.likes_count -= 1
    
    db.session.commit()
    return jsonify({'message': 'Post unliked successfully'})

# Comments
@community_bp.route('/community/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(post_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    comment = PostComment(
        post_id=post_id,
        user_id=user_id,
        content=data['content'],
        parent_id=data.get('parent_id')
    )
    
    db.session.add(comment)
    
    # Update comments count
    post = CommunityPost.query.get(post_id)
    post.comments_count += 1
    
    db.session.commit()
    
    return jsonify({
        'id': comment.id,
        'message': 'Comment created successfully'
    }), 201

@community_bp.route('/community/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    user_id = int(get_jwt_identity())
    comment = PostComment.query.get_or_404(comment_id)
    
    if comment.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    comment.content = data.get('content', comment.content)
    
    db.session.commit()
    return jsonify({'message': 'Comment updated successfully'})

@community_bp.route('/community/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    user_id = int(get_jwt_identity())
    comment = PostComment.query.get_or_404(comment_id)
    
    if comment.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Update comments count
    post = CommunityPost.query.get(comment.post_id)
    post.comments_count -= 1
    
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Comment deleted successfully'})

# Comment Likes
@community_bp.route('/community/comments/<int:comment_id>/like', methods=['POST'])
@jwt_required()
def like_comment(comment_id):
    user_id = int(get_jwt_identity())
    
    # Check if already liked
    existing_like = CommentLike.query.filter_by(comment_id=comment_id, user_id=user_id).first()
    if existing_like:
        return jsonify({'message': 'Comment already liked'}), 400
    
    like = CommentLike(comment_id=comment_id, user_id=user_id)
    db.session.add(like)
    
    # Update likes count
    comment = PostComment.query.get(comment_id)
    comment.likes_count += 1
    
    db.session.commit()
    return jsonify({'message': 'Comment liked successfully'})

@community_bp.route('/community/comments/<int:comment_id>/like', methods=['DELETE'])
@jwt_required()
def unlike_comment(comment_id):
    user_id = int(get_jwt_identity())
    
    like = CommentLike.query.filter_by(comment_id=comment_id, user_id=user_id).first()
    if not like:
        return jsonify({'message': 'Comment not liked'}), 400
    
    db.session.delete(like)
    
    # Update likes count
    comment = PostComment.query.get(comment_id)
    comment.likes_count -= 1
    
    db.session.commit()
    return jsonify({'message': 'Comment unliked successfully'})
