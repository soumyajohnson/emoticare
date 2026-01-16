from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.models import Conversation, Message, User, AuditLog
from server.utils.security import DataEncryptor
from server.ai_modules.llm_client import LLMClient
# from server.ai_modules.sentiment import analyze_sentiment # If needed
import datetime

chat_bp = Blueprint('chat', __name__)

def get_encryptor():
    return DataEncryptor(current_app.config['ENCRYPTION_MASTER_KEY'])

@chat_bp.route('/conversations', methods=['POST'])
@jwt_required()
def create_conversation():
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    
    conv = Conversation(user=user)
    conv.save()
    
    return jsonify({'conversation_id': str(conv.id)}), 201

@chat_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    user_id = get_jwt_identity()
    conversations = Conversation.objects(user=user_id).order_by('-created_at')
    
    return jsonify([{
        'id': str(c.id),
        'created_at': c.created_at
    } for c in conversations]), 200

@chat_bp.route('/conversations/<conversation_id>', methods=['GET'])
@jwt_required()
def get_conversation_messages(conversation_id):
    user_id = get_jwt_identity()
    # Verify ownership
    conv = Conversation.objects(id=conversation_id, user=user_id).first()
    if not conv:
        return jsonify({'error': 'Conversation not found'}), 404

    messages = Message.objects(conversation=conv).order_by('created_at')
    
    encryptor = get_encryptor()
    decrypted_messages = []
    
    for m in messages:
        content = encryptor.decrypt(m.content_encrypted, m.key_encrypted)
        decrypted_messages.append({
            'role': m.role,
            'content': content,
            'language': m.language,
            'created_at': m.created_at
        })

    return jsonify(decrypted_messages), 200

@chat_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    conversation_id = data.get('conversation_id')
    message_text = data.get('messageText')
    language = data.get('language', 'en')

    if not conversation_id or not message_text:
        return jsonify({'error': 'Missing conversation_id or messageText'}), 400

    # Verify conversation ownership
    conv = Conversation.objects(id=conversation_id, user=user_id).first()
    if not conv:
        return jsonify({'error': 'Conversation not found'}), 404

    encryptor = get_encryptor()

    # 1. Encrypt and store User Message
    enc_content, enc_key = encryptor.encrypt(message_text)
    user_msg = Message(
        conversation=conv,
        role='user',
        content_encrypted=enc_content,
        key_encrypted=enc_key,
        language=language
    )
    user_msg.save()

    # 2. Call AI (No logging of plaintext!)
    try:
        llm_client = LLMClient()
        gpt_response = llm_client.generate_reply(message_text, language)
    except Exception as e:
        return jsonify({'error': 'AI Service Error'}), 500

    # 3. Encrypt and store Assistant Reply
    enc_content_ai, enc_key_ai = encryptor.encrypt(gpt_response)
    ai_msg = Message(
        conversation=conv,
        role='assistant',
        content_encrypted=enc_content_ai,
        key_encrypted=enc_key_ai,
        language=language
    )
    ai_msg.save()

    return jsonify({
        'response': gpt_response,
        'sentiment': 'neutral' # Placeholder or call sentiment analysis
    }), 200
