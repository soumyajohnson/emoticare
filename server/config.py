import os
from dotenv import load_dotenv
import mongomock

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_secret')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev_jwt_secret')
    MONGODB_SETTINGS = {
        'host': os.getenv('MONGODB_HOST', 'mongodb://localhost:27017/emoticare')
    }
    ENCRYPTION_MASTER_KEY = os.getenv('ENCRYPTION_MASTER_KEY')
    
    # LLM Configuration
    LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'gemini')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')
    
    # Retention policy (days)
    DATA_RETENTION_DAYS = int(os.getenv('DATA_RETENTION_DAYS', 30))

class TestConfig(Config):
    TESTING = True
    MONGODB_SETTINGS = {
        'db': 'emoticare_test',
        'mongo_client_class': mongomock.MongoClient
    }
    # Dummy Fernet Key (valid format)
    ENCRYPTION_MASTER_KEY = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
    
    # Dummy Gemini Key for testing
    GEMINI_API_KEY = 'TEST_API_KEY'
    LLM_PROVIDER = 'gemini'