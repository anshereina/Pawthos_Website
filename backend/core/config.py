import os
from starlette.config import Config

config = Config('.env')

# JWT Settings
SECRET_KEY = config('SECRET_KEY', cast=str, default="your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database Settings
DATABASE_URL = config('DATABASE_URL', cast=str, default="postgresql://user:password@localhost/dbname")

SMTP_USER = config('SMTP_USER', cast=str, default=os.getenv('SMTP_USER'))
SMTP_PASS = config('SMTP_PASS', cast=str, default=os.getenv('SMTP_PASS'))
