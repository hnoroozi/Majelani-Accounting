import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Define the base directory of the project
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    """Configuration settings for Flask app"""

    # Flask Secret Key (for security and session management)
    SECRET_KEY = os.getenv("SECRET_KEY", "your-very-secret-key")  # Ensure security with an environment variable

    # CSRF Protection for Flask forms
    WTF_CSRF_ENABLED = True

    # Database Configuration (using SQLite, change for PostgreSQL/MySQL if needed)
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'app.db')}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Prevents excessive memory usage

    # Flask Session Settings for security
    SESSION_COOKIE_SECURE = True  # Ensures cookies are only sent over HTTPS
    SESSION_COOKIE_HTTPONLY = True  # Protects against XSS attacks
    SESSION_COOKIE_SAMESITE = "Lax"  # Prevents CSRF attacks

    # Flask-Mail Configuration (using environment variables for security)
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))  # Ensure integer value
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True").lower() in ["true", "1"]
    MAIL_USE_SSL = os.getenv("MAIL_USE_SSL", "False").lower() in ["true", "1"]
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")  # Secure email
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")  # Secure password
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER")  # Default sender email

# Create an instance of Config to be used in the app
config = Config()