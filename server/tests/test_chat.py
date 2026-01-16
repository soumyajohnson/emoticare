from unittest.mock import patch, MagicMock
from server.models import User, Conversation

def test_chat_flow(client):
    # 1. Register & Login
    client.post('/auth/register', json={'email': 'chatuser@test.com', 'password': 'password'})
    login_resp = client.post('/auth/login', json={'email': 'chatuser@test.com', 'password': 'password'})
    token = login_resp.json['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # 2. Create Conversation
    conv_resp = client.post('/conversations', headers=headers)
    conv_id = conv_resp.json['conversation_id']

    # 3. Mock Gemini Response
    with patch('server.ai_modules.llm_client.genai.GenerativeModel') as MockModel:
        mock_model_instance = MockModel.return_value
        mock_response = MagicMock()
        mock_response.text = 'I understand you are feeling down.'
        mock_model_instance.generate_content.return_value = mock_response

        # 4. Send Message
        chat_resp = client.post('/chat', headers=headers, json={
            'conversation_id': conv_id,
            'messageText': 'I am sad',
            'language': 'en'
        })
        
        assert chat_resp.status_code == 200
        assert chat_resp.json['response'] == 'I understand you are feeling down.'

def test_chat_gemini_failure(client):
    # 1. Register & Login
    client.post('/auth/register', json={'email': 'failuser@test.com', 'password': 'password'})
    login_resp = client.post('/auth/login', json={'email': 'failuser@test.com', 'password': 'password'})
    token = login_resp.json['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # 2. Create Conversation
    conv_resp = client.post('/conversations', headers=headers)
    conv_id = conv_resp.json['conversation_id']

    # 3. Mock Gemini Failure
    with patch('server.ai_modules.llm_client.genai.GenerativeModel') as MockModel:
        mock_model_instance = MockModel.return_value
        mock_model_instance.generate_content.side_effect = Exception("API Unavailable")

        # 4. Send Message
        chat_resp = client.post('/chat', headers=headers, json={
            'conversation_id': conv_id,
            'messageText': 'I am sad',
            'language': 'en'
        })
        
        # Should return fallback response, not 500
        assert chat_resp.status_code == 200
        assert "trouble connecting" in chat_resp.json['response']