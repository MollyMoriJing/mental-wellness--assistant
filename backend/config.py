import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("JWT_SECRET_KEY", "mental-wellness-secret-key-2024")
    # Force SQLite for development
    SQLALCHEMY_DATABASE_URI = "sqlite:///mental_wellness.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "mental-wellness-secret-key-2024")
    JWT_ACCESS_TOKEN_EXPIRES = 7200