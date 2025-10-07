#!/usr/bin/env python3
"""
Force recreate seed data
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

from backend.models.user import db, User, CommunityPost, PostComment, PostLike, CommentLike, CoachingSession
from backend.app import create_app

def force_create_seed_data():
    """Force create seed data for the application"""
    app = create_app()
    
    with app.app_context():
        # Create database tables
        db.create_all()
        
        print("Force creating seed data...")
        
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

if __name__ == '__main__':
    force_create_seed_data()
