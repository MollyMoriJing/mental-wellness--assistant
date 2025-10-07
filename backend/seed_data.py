#!/usr/bin/env python3
"""
Seed data script for Mental Wellness Assistant
Creates sample community posts, coaches, and initial data
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

def create_seed_data():
    """Create seed data for the application"""
    app = create_app()
    
    with app.app_context():
        # Create database tables
        db.create_all()
        
        # Check if data already exists
        if User.query.count() > 1:  # More than just the test user
            print("Seed data already exists. Skipping...")
            return
        
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
                'bio': 'Certified Life Coach focused on productivity and work-life balance. Former corporate executive who understands the pressures of modern life.',
                'role': 'coach',
                'is_verified_coach': True
            },
            {
                'email': 'emma.wilson@wellness.com',
                'password': 'coach123',
                'display_name': 'Emma Wilson',
                'bio': 'Relationship and family therapist with expertise in communication and emotional intelligence. Helping people build stronger connections.',
                'role': 'coach',
                'is_verified_coach': True
            },
            {
                'email': 'david.kim@wellness.com',
                'password': 'coach123',
                'display_name': 'David Kim',
                'bio': 'Mindfulness and meditation instructor. Former monk with 15 years of meditation practice. Specializes in mindfulness-based stress reduction.',
                'role': 'coach',
                'is_verified_coach': True
            },
            {
                'email': 'lisa.patel@wellness.com',
                'password': 'coach123',
                'display_name': 'Dr. Lisa Patel',
                'bio': 'Trauma-informed therapist specializing in PTSD and recovery. EMDR certified with a gentle, empathetic approach to healing.',
                'role': 'coach',
                'is_verified_coach': True
            }
        ]
        
        for coach_data in coaches_data:
            user = User(
                email=coach_data['email'],
                display_name=coach_data['display_name'],
                bio=coach_data['bio'],
                role=coach_data['role'],
                is_verified_coach=coach_data['is_verified_coach']
            )
            user.set_password(coach_data['password'])
            db.session.add(user)
            users.append(user)
        
        # Create community members
        community_members = [
            {
                'email': 'alex.johnson@email.com',
                'password': 'user123',
                'display_name': 'Alex Johnson',
                'bio': 'Software engineer learning to manage work stress'
            },
            {
                'email': 'maria.garcia@email.com',
                'password': 'user123',
                'display_name': 'Maria Garcia',
                'bio': 'Graduate student navigating anxiety and academic pressure'
            },
            {
                'email': 'james.smith@email.com',
                'password': 'user123',
                'display_name': 'James Smith',
                'bio': 'Parent of two, working on work-life balance'
            },
            {
                'email': 'sophie.brown@email.com',
                'password': 'user123',
                'display_name': 'Sophie Brown',
                'bio': 'Recovery journey, sharing experiences to help others'
            },
            {
                'email': 'ryan.davis@email.com',
                'password': 'user123',
                'display_name': 'Ryan Davis',
                'bio': 'Recent college grad dealing with career uncertainty'
            }
        ]
        
        for member_data in community_members:
            user = User(
                email=member_data['email'],
                display_name=member_data['display_name'],
                bio=member_data['bio']
            )
            user.set_password(member_data['password'])
            db.session.add(user)
            users.append(user)
        
        db.session.commit()
        print(f"Created {len(users)} users")
        
        # Create community posts
        posts_data = [
            {
                'title': 'Finally had a good day after weeks of struggling',
                'content': 'I\'ve been dealing with anxiety for months, but today I managed to go to the grocery store without having a panic attack. It might seem small, but it feels like a huge victory. I used the breathing techniques my therapist taught me and it actually worked! Anyone else have small wins they want to celebrate?',
                'category': 'success',
                'is_anonymous': False,
                'author': users[5],  # Sophie Brown
                'likes': [users[6], users[7], users[8], users[9]],  # Other community members
                'comments': [
                    {
                        'content': 'That\'s amazing! Small wins are still wins. Proud of you! 💪',
                        'author': users[6]  # Alex Johnson
                    },
                    {
                        'content': 'I\'ve been there too. The grocery store used to be so overwhelming for me. You\'re doing great!',
                        'author': users[7]  # Maria Garcia
                    }
                ]
            },
            {
                'title': 'Feeling overwhelmed with work and life balance',
                'content': 'I\'m a working parent and I feel like I\'m constantly failing at everything. Work is demanding, kids need attention, and I barely have time for myself. How do you all manage to keep it all together? I\'m starting to feel burned out.',
                'category': 'support',
                'is_anonymous': False,
                'author': users[8],  # James Smith
                'likes': [users[5], users[6], users[7], users[9]],
                'comments': [
                    {
                        'content': 'You\'re not failing! Being a working parent is incredibly challenging. Have you tried time-blocking? It helped me a lot.',
                        'author': users[6]  # Alex Johnson
                    },
                    {
                        'content': 'I feel this so much. Sometimes I have to remind myself that \'good enough\' is actually good enough. You\'re doing your best.',
                        'author': users[7]  # Maria Garcia
                    }
                ]
            },
            {
                'title': 'What are some effective ways to manage social anxiety?',
                'content': 'I have a big presentation at work next week and I\'m already getting anxious about it. My heart starts racing just thinking about speaking in front of people. What strategies have worked for you? I\'ve tried deep breathing but I need more tools.',
                'category': 'question',
                'is_anonymous': False,
                'author': users[9],  # Ryan Davis
                'likes': [users[5], users[6], users[7], users[8]],
                'comments': [
                    {
                        'content': 'I practice the 4-7-8 breathing technique before presentations. Also, I try to reframe my anxiety as excitement - same physical symptoms, different mindset.',
                        'author': users[6]  # Alex Johnson
                    },
                    {
                        'content': 'Visualization helps me! I imagine the presentation going well and the audience being engaged. It\'s like mental rehearsal.',
                        'author': users[7]  # Maria Garcia
                    },
                    {
                        'content': 'Remember that most people want you to succeed. They\'re not there to judge you harshly. You\'ve got this!',
                        'author': users[5]  # Sophie Brown
                    }
                ]
            },
            {
                'title': 'Gratitude practice changed my perspective',
                'content': 'I started writing down three things I\'m grateful for every morning, and it\'s honestly changed how I see the world. Even on really hard days, I can find something small to appreciate. It doesn\'t fix everything, but it helps me stay grounded. Highly recommend trying it!',
                'category': 'general',
                'is_anonymous': False,
                'author': users[6],  # Alex Johnson
                'likes': [users[5], users[7], users[8], users[9]],
                'comments': [
                    {
                        'content': 'I love this! I do gratitude journaling too. It\'s amazing how it shifts your mindset.',
                        'author': users[7]  # Maria Garcia
                    },
                    {
                        'content': 'I\'ve been meaning to try this. Do you write it down or just think about it?',
                        'author': users[8]  # James Smith
                    }
                ]
            },
            {
                'title': 'Struggling with imposter syndrome at work',
                'content': 'I got promoted recently but I can\'t shake the feeling that I don\'t deserve it and everyone will find out I\'m not as capable as they think. I work twice as hard as everyone else just to prove I belong, but it\'s exhausting. How do you deal with these feelings?',
                'category': 'support',
                'is_anonymous': True,  # Anonymous post
                'author': users[7],  # Maria Garcia
                'likes': [users[5], users[6], users[8], users[9]],
                'comments': [
                    {
                        'content': 'Imposter syndrome is so common, especially after promotions. You got promoted for a reason - you ARE capable!',
                        'author': users[6]  # Alex Johnson
                    },
                    {
                        'content': 'I struggle with this too. Something that helps me is making a list of my accomplishments when I feel this way.',
                        'author': users[8]  # James Smith
                    }
                ]
            },
            {
                'title': 'Meditation isn\'t working for me - am I doing it wrong?',
                'content': 'I\'ve been trying to meditate for a month but my mind keeps wandering and I get frustrated. I can\'t seem to \'clear my mind\' like everyone says. Is this normal? Should I try a different approach?',
                'category': 'question',
                'is_anonymous': False,
                'author': users[8],  # James Smith
                'likes': [users[5], users[6], users[7], users[9]],
                'comments': [
                    {
                        'content': 'Mind wandering is totally normal! The goal isn\'t to clear your mind, it\'s to notice when it wanders and gently bring it back. You\'re already doing it right!',
                        'author': users[6]  # Alex Johnson
                    },
                    {
                        'content': 'Try guided meditations first. Apps like Headspace or Calm can help you get started.',
                        'author': users[7]  # Maria Garcia
                    }
                ]
            },
            {
                'title': 'Celebrating 6 months of therapy!',
                'content': 'I was so scared to start therapy, but it\'s been the best decision I\'ve made. I\'ve learned so much about myself and have tools to handle difficult emotions. If you\'re on the fence about starting therapy, I highly recommend it. It\'s not always easy, but it\'s worth it.',
                'category': 'success',
                'is_anonymous': False,
                'author': users[5],  # Sophie Brown
                'likes': [users[6], users[7], users[8], users[9]],
                'comments': [
                    {
                        'content': 'Congratulations! Therapy has been life-changing for me too. Proud of you for taking that step!',
                        'author': users[6]  # Alex Johnson
                    },
                    {
                        'content': 'Thank you for sharing this. I\'ve been considering therapy but was nervous. This gives me hope.',
                        'author': users[7]  # Maria Garcia
                    }
                ]
            }
        ]
        
        for post_data in posts_data:
            # Create post
            post = CommunityPost(
                user_id=post_data['author'].id,
                title=post_data['title'],
                content=post_data['content'],
                category=post_data['category'],
                is_anonymous=post_data['is_anonymous']
            )
            db.session.add(post)
            db.session.flush()  # Get the post ID
            
            # Add likes
            for user in post_data['likes']:
                like = PostLike(post_id=post.id, user_id=user.id)
                db.session.add(like)
                post.likes_count += 1
            
            # Add comments
            for comment_data in post_data['comments']:
                comment = PostComment(
                    post_id=post.id,
                    user_id=comment_data['author'].id,
                    content=comment_data['content']
                )
                db.session.add(comment)
                post.comments_count += 1
            
            db.session.commit()
        
        print(f"Created {len(posts_data)} community posts")
        
        # Create some coaching sessions
        sessions_data = [
            {
                'client': users[6],  # Alex Johnson
                'coach': users[0],   # Dr. Sarah Chen
                'title': 'Work Stress Management',
                'description': 'Need help managing stress from high-pressure software development projects',
                'status': 'active'
            },
            {
                'client': users[7],  # Maria Garcia
                'coach': users[1],   # Michael Rodriguez
                'title': 'Academic Pressure and Anxiety',
                'description': 'Graduate school is overwhelming and I need strategies to cope',
                'status': 'pending'
            },
            {
                'client': users[8],  # James Smith
                'coach': users[2],   # Emma Wilson
                'title': 'Work-Life Balance',
                'description': 'Struggling to balance work demands with family time',
                'status': 'completed'
            }
        ]
        
        for session_data in sessions_data:
            session = CoachingSession(
                client_id=session_data['client'].id,
                coach_id=session_data['coach'].id,
                title=session_data['title'],
                description=session_data['description'],
                status=session_data['status']
            )
            db.session.add(session)
        
        db.session.commit()
        print(f"Created {len(sessions_data)} coaching sessions")
        
        print("Seed data created successfully!")
        print("\nSample login credentials:")
        print("Coaches:")
        for coach in coaches_data:
            print(f"  {coach['email']} / {coach['password']}")
        print("\nCommunity Members:")
        for member in community_members:
            print(f"  {member['email']} / {member['password']}")

if __name__ == '__main__':
    create_seed_data()
