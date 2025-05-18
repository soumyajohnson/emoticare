from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_modules.gpt_helper import chat_with_gpt
from ai_modules.sentiment import analyze_sentiment

# Create the app
app = Flask(__name__)

# Enable CORS for all routes and origins (frontend communication)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        user_input = data.get('text', '')

        # Run sentiment analysis (optional)
        sentiment = analyze_sentiment(user_input)

        # Get GPT response
        gpt_response = chat_with_gpt(user_input)

        return jsonify({
            'response': gpt_response,
            'sentiment': sentiment
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
