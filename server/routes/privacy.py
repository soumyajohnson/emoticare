from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.models import User, Conversation, Message, AuditLog

privacy_bp = Blueprint('privacy', __name__, url_prefix='/privacy')

@privacy_bp.route('/delete-my-data', methods=['DELETE'])
@jwt_required()
def delete_my_data():
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Find all conversations
    conversations = Conversation.objects(user=user)
    
    # Delete all messages in those conversations
    # (Cascading usually handles this if configured, but let's be explicit for safety)
    for conv in conversations:
        Message.objects(conversation=conv).delete()
        conv.delete()

    # Log the action (Audit logs are usually kept even if user data is deleted, for legal reasons, but anonymized if needed)
    # Here we keep the log attached to the user_id (which still exists).
    AuditLog(user=user, action='DELETE_DATA', details='User requested full data deletion').save()

    return jsonify({'message': 'All conversation data deleted successfully'}), 200
