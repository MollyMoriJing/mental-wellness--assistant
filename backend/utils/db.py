from flask_sqlalchemy import SQLAlchemy

# Singleton SQLAlchemy object
# To be initialized in app context

db = SQLAlchemy()