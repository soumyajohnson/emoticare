from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_socketio import SocketIO

bcrypt = Bcrypt()
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address)
# Explicitly use 'threading' async mode to avoid eventlet/gevent issues on Python 3.13+
# simple-websocket will be used for WebSocket transport if available.
socketio = SocketIO(cors_allowed_origins="*", async_mode='threading')
