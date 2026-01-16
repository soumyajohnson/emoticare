from flask import Flask
from flask_cors import CORS
from server.config import Config
from server.extensions import bcrypt, jwt, limiter
from server.models import db
from server.routes.auth import auth_bp
from server.routes.chat import chat_bp
from server.routes.privacy import privacy_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Extensions
    bcrypt.init_app(app)
    jwt.init_app(app)
    db.init_app(app)
    limiter.init_app(app)
    
    # CORS: Allow frontend (e.g., localhost:3000)
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000"]}}, supports_credentials=True)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(privacy_bp)

    @app.route('/')
    def index():
        return "EmotiCare API Secure is Running"

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=8000, debug=True)