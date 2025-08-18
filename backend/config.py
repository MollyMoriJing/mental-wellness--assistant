import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default-secret-key-change-in-production")
    SQLALCHEMY_DATABASE_URI = os.getenv("MYSQL_URL", "sqlite:///mental_wellness.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour