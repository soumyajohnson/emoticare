from flask import Blueprint, request, jsonify
from server.models import User, AuditLog
from server.extensions import bcrypt, jwt, limiter
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, create_refresh_token
import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    if User.objects(email=email).first():
        return jsonify({'error': 'User already exists'}), 409

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(email=email, password_hash=hashed_pw)
    user.save()

    # Audit
    AuditLog(user=user, action='REGISTER', ip_address=request.remote_addr).save()

    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.objects(email=email).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=str(user.id), expires_delta=datetime.timedelta(hours=1))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        # Audit
        AuditLog(user=user, action='LOGIN', ip_address=request.remote_addr).save()

        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
    
    # Audit failure
    AuditLog(action='LOGIN_FAILED', details=f"Email: {email}", ip_address=request.remote_addr).save()
    return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user, expires_delta=datetime.timedelta(hours=1))
    return jsonify({'access_token': new_access_token}), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    # In a stateless JWT setup, the client discards the token. 
    # For higher security, we would add the JTI to a Redis blocklist here.
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'id': str(user.id),
        'email': user.email,
        'created_at': user.created_at
    }), 200
