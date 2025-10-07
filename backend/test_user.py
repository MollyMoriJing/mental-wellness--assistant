#!/usr/bin/env python3
"""
Create a test user for testing
"""

import os
import sys

# Add parent directory to path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(CURRENT_DIR)
if PARENT_DIR not in sys.path:
    sys.path.append(PARENT_DIR)

from backend.models.user import db, User
from backend.app import create_app

def create_test_user():
    """Create a test user"""
    app = create_app()
    
    with app.app_context():
        # Check if test user exists
        test_user = User.query.filter_by(email='test@example.com').first()
        if test_user:
            print("Test user already exists")
            return
        
        # Create test user
        test_user = User(
            email='test@example.com',
            display_name='Test User',
            role='user'
        )
        test_user.set_password('password')
        
        db.session.add(test_user)
        db.session.commit()
        print("Test user created successfully!")

if __name__ == '__main__':
    create_test_user()
