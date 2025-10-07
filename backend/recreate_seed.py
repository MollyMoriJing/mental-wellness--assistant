#!/usr/bin/env python3
"""
Recreate seed data with SQLite database
"""

import os
import sys
from datetime import datetime, timedelta
import random

# Add parent directory to path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(CURRENT_DIR)
if PARENT_DIR not in sys.path:
    sys.path.append(PARENT_DIR)

# Force SQLite database
os.environ['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mental_wellness.db'

from backend.models.user import db, User, CommunityPost, PostComment, PostLike, CommentLike, CoachingSession
from backend.app import create_app

def recreate_seed_data():
    """Recreate seed data with SQLite database"""
    app = create_app()
    
    with app.app_context():
        # Drop and recreate all tables
        print("Dropping existing tables...")
        db.drop_all()
        print("Creating new tables...")
        db.create_all()
        
        print("Creating seed data...")
        
        # Create sample users
        users = []
        
        # Create coaches
        coaches_data = [
            {
                'email': 'sarah.chen@wellness.com',
                'password': 'coach123',
                'display_name': 'Dr. Sarah Chen',
                'bio': 'Licensed Clinical Psychologist specializing in anxiety and stress management. 10+ years experience helping people build resilience and find balance.',
                'role': 'coach',
                'is_verified_coach': True
            },
            {
                'email': 'michael.rodriguez@wellness.com',
                'password': 'coach123',
                'display_name': 'Michael Rodriguez',
                'bio': 'Certified Life Coach and Mindfulness Practitioner. Expert in work-life balance, career transitions, and personal development.',
                'role': 'coach',
                'is_verified_coach': True
            },
            {
                'email': 'emma.wilson@wellness.com',
                'password': 'coach123',
                'display_name': 'Emma Wilson',
                'bio': 'Mental Health Counselor with expertise in depression, trauma recovery, and family therapy. Passionate about holistic wellness approaches.',
                'role': 'coach',
                'is_verified_coach': True
            }
        ]
        
        for coach_data in coaches_data:
            coach = User(
                email=coach_data['email'],
                display_name=coach_data['display_name'],
                bio=coach_data['bio'],
                role=coach_data['role'],
                is_verified_coach=coach_data['is_verified_coach']
            )
            coach.set_password(coach_data['password'])
            users.append(coach)
        
        # Create regular users
        regular_users_data = [
            {
                'email': 'alex.johnson@email.com',
                'password': 'user123',
                'display_name': 'Alex Johnson',
                'role': 'user'
            },
            {
                'email': 'maria.garcia@email.com',
                'password': 'user123',
                'display_name': 'Maria Garcia',
                'role': 'user'
            },
            {
                'email': 'james.smith@email.com',
                'password': 'user123',
                'display_name': 'James Smith',
                'role': 'user'
            },
            {
                'email': 'sophie.brown@email.com',
                'password': 'user123',
                'display_name': 'Sophie Brown',
                'role': 'user'
            }
        ]
        
        for user_data in regular_users_data:
            user = User(
                email=user_data['email'],
                display_name=user_data['display_name'],
                role=user_data['role']
            )
            user.set_password(user_data['password'])
            users.append(user)
        
        # Add all users to database
        for user in users:
            db.session.add(user)
        
        db.session.commit()
        print(f"Created {len(users)} users successfully!")
        
        # Create some sample community posts
        posts_data = [
            {
                'title': 'Feeling overwhelmed with work stress',
                'content': 'I\'ve been working 60+ hour weeks for the past month and I\'m starting to feel completely burned out. Has anyone found effective ways to manage work-life balance?',
                'category': 'support',
                'user_id': users[3].id  # Maria Garcia
            },
            {
                'title': 'Celebrating small wins!',
                'content': 'Today I managed to get out of bed and take a 10-minute walk. It might seem small, but it\'s the first time in weeks I\'ve felt motivated to do anything. Progress!',
                'category': 'success',
                'user_id': users[4].id  # James Smith
            },
            {
                'title': 'Meditation techniques that actually work',
                'content': 'I\'ve tried meditation apps but they never stick. What are some simple, practical meditation techniques that have worked for you?',
                'category': 'question',
                'user_id': users[5].id  # Sophie Brown
            }
        ]
        
        for post_data in posts_data:
            post = CommunityPost(
                title=post_data['title'],
                content=post_data['content'],
                category=post_data['category'],
                user_id=post_data['user_id']
            )
            db.session.add(post)
        
        db.session.commit()
        print(f"Created {len(posts_data)} community posts successfully!")
        
        print("Seed data recreation completed!")

if __name__ == '__main__':
    recreate_seed_data()
