#!/usr/bin/env python3
"""
Add users to Railway database
"""

import os
import sys
import requests
from datetime import datetime

# Add parent directory to path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(CURRENT_DIR)
if PARENT_DIR not in sys.path:
    sys.path.append(PARENT_DIR)

def add_users_to_railway():
    """Add users to Railway database via API"""
    
    # Get Railway URL from user
    railway_url = input("Enter your Railway URL (e.g., https://mental-wellness-assistant-production.up.railway.app): ").strip()
    if not railway_url:
        print("❌ No URL provided")
        return
    
    # Test users to add
    users = [
        {
            "email": "sarah.chen@wellness.com",
            "password": "coach123",
            "display_name": "Dr. Sarah Chen",
            "role": "coach"
        },
        {
            "email": "alex.johnson@email.com", 
            "password": "user123",
            "display_name": "Alex Johnson",
            "role": "user"
        },
        {
            "email": "test@example.com",
            "password": "user123", 
            "display_name": "Test User",
            "role": "user"
        }
    ]
    
    print(f"🚀 Adding users to {railway_url}")
    
    for user in users:
        try:
            # Register user
            response = requests.post(f"{railway_url}/api/auth/register", json=user)
            
            if response.status_code == 200:
                print(f"✅ Added user: {user['email']}")
            elif response.status_code == 400 and "already exists" in response.text:
                print(f"ℹ️  User already exists: {user['email']}")
            else:
                print(f"❌ Failed to add {user['email']}: {response.text}")
                
        except Exception as e:
            print(f"❌ Error adding {user['email']}: {e}")
    
    print("\n🎉 User creation complete!")
    print("\nYou can now login with:")
    print("• sarah.chen@wellness.com / coach123")
    print("• alex.johnson@email.com / user123") 
    print("• test@example.com / user123")

if __name__ == "__main__":
    add_users_to_railway()
