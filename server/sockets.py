from flask import request, current_app
from flask_socketio import emit, join_room, disconnect
from flask_jwt_extended import decode_token
from server.models import Conversation, Message, User
from server.utils.security import DataEncryptor
from server.ai_modules.gemini_streamer import GeminiStreamer
from server.extensions import socketio
import logging
import datetime

logger = logging.getLogger(__name__)

def get_encryptor():
    return DataEncryptor(current_app.config['ENCRYPTION_MASTER_KEY'])

@socketio.on('connect')
def handle_connect():
    logger.info(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('join_session')
def handle_join(data):
    """
    User joins a room corresponding to their conversation_id.
    Auth: JWT token must be valid and user must own the conversation.
    """
    token = data.get('token')
    conversation_id = data.get('conversation_id')
    
    if not token or not conversation_id:
        emit('error', {'message': 'Missing token or conversation_id'})
        return

    try:
        decoded = decode_token(token)
        user_id = decoded['sub']
        
        # Verify ownership
        conv = Conversation.objects(id=conversation_id, user=user_id).first()
        if not conv:
            emit('error', {'message': 'Conversation not found or access denied'})
            return

        join_room(conversation_id)
        emit('session_joined', {'status': 'success', 'conversation_id': conversation_id})
        logger.info(f"User {user_id} joined room {conversation_id}")

    except Exception as e:
        logger.error(f"Join Error: {e}")
        emit('error', {'message': 'Invalid token'})

@socketio.on('user_message')
def handle_user_message(data):
    """
    Receives user message, saves it, streams AI response, saves AI response.
    """
    token = data.get('token')
    conversation_id = data.get('conversation_id')
    message_text = data.get('text')
    language = data.get('language', 'en')

    if not token or not conversation_id or not message_text:
        emit('error', {'message': 'Invalid payload'})
        return

    try:
        # 1. Auth & Validation
        decoded = decode_token(token)
        user_id = decoded['sub']
        conv = Conversation.objects(id=conversation_id, user=user_id).first()
        if not conv:
            emit('error', {'message': 'Access denied'})
            return

        encryptor = get_encryptor()

        # 2. Save User Message (Encrypted)
        enc_content, enc_key = encryptor.encrypt(message_text)
        user_msg = Message(
            conversation=conv,
            role='user',
            content_encrypted=enc_content,
            key_encrypted=enc_key,
            language=language
        )
        user_msg.save()

        # 3. Stream AI Response
        streamer = GeminiStreamer()
        full_response = ""
        
        # Emit a 'start' event if needed, but 'assistant_token' implies start
        for chunk in streamer.stream_generate(message_text, language):
            full_response += chunk
            # Emit to the specific room (conversation)
            socketio.emit('assistant_token', {'chunk': chunk, 'conversation_id': conversation_id}, room=conversation_id)

        # 4. Save Assistant Message (Encrypted)
        if full_response:
            enc_content_ai, enc_key_ai = encryptor.encrypt(full_response)
            ai_msg = Message(
                conversation=conv,
                role='assistant',
                content_encrypted=enc_content_ai,
                key_encrypted=enc_key_ai,
                language=language
            )
            ai_msg.save()
            
            socketio.emit('assistant_done', {'conversation_id': conversation_id}, room=conversation_id)

    except Exception as e:
        logger.error(f"Streaming Error: {e}")
        emit('error', {'message': 'Internal processing error'})