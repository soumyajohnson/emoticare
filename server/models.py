from flask_mongoengine import MongoEngine
import datetime

db = MongoEngine()

class User(db.Document):
    email = db.StringField(required=True, unique=True)
    password_hash = db.StringField(required=True)
    created_at = db.DateTimeField(default=datetime.datetime.utcnow)
    
    meta = {'collection': 'users'}

class Conversation(db.Document):
    user = db.ReferenceField(User, reverse_delete_rule=db.CASCADE, required=True)
    created_at = db.DateTimeField(default=datetime.datetime.utcnow)
    
    meta = {'collection': 'conversations'}

class Message(db.Document):
    conversation = db.ReferenceField(Conversation, reverse_delete_rule=db.CASCADE, required=True)
    role = db.StringField(required=True, choices=('user', 'assistant'))
    content_encrypted = db.StringField(required=True)
    key_encrypted = db.StringField(required=True) # Data key for envelope encryption
    language = db.StringField(default='en')
    created_at = db.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'messages',
        'indexes': [
            {'fields': ['created_at'], 'expireAfterSeconds': 3600 * 24 * 60} # Default TTL, but logic can handle it too.
        ]
    }

class AuditLog(db.Document):
    user = db.ReferenceField(User, required=False) # Can be null for system actions or failed logins
    action = db.StringField(required=True)
    details = db.StringField()
    ip_address = db.StringField()
    timestamp = db.DateTimeField(default=datetime.datetime.utcnow)

    meta = {'collection': 'audit_logs'}
