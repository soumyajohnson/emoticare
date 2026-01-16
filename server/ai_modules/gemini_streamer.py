import google.generativeai as genai
import logging
from flask import current_app

logger = logging.getLogger(__name__)

class GeminiStreamer:
    def __init__(self):
        self.api_key = current_app.config.get('GEMINI_API_KEY')
        self.model_name = current_app.config.get('GEMINI_MODEL', 'gemini-2.5-flash')
        
        if self.api_key:
            genai.configure(api_key=self.api_key)
        else:
            logger.error("GEMINI_API_KEY is missing")

    def _build_system_prompt(self, language):
        base_prompt = """
You are an emotionally supportive AI trained to sound like a human therapist.
Keep replies:
- Short and informal (1 to 2 sentences)
- Natural and friendly
- Avoid repeating “I’m sorry to hear that” or long self-care reminders
- Avoid clinical tone or scripted-sounding advice
- Use contractions like "you're" and "it's" to feel casual
- Ask a couple of questions and then Try to give solutions on the main problem
Respond like you're in a text conversation, not a therapy brochure.
"""
        if language == 'hi' or language == 'hi-IN':
            return base_prompt + "\nIMPORTANT: Respond in Hindi (Devenagari script). Keep it casual and short."
        else:
            return base_prompt + "\nIMPORTANT: Respond in English."

    def stream_generate(self, user_text, language='en'):
        """
        Yields chunks of text from Gemini.
        """
        if not self.api_key:
            yield "System Error: Missing API Key."
            return

        system_prompt = self._build_system_prompt(language)
        full_prompt = f"{system_prompt}\n\nUser: {user_text}\n"

        try:
            model = genai.GenerativeModel(self.model_name)
            
            # Streaming call
            response = model.generate_content(
                full_prompt,
                stream=True,
                generation_config=genai.types.GenerationConfig(# Keep it short
                    temperature=0.5
                )
            )

            for chunk in response:
                if chunk.text:
                    yield chunk.text

        except Exception as e:
            logger.error(f"Gemini Streaming Error: {e}")
            # Yield a fallback message so the user sees something
            if language == 'hi' or language == 'hi-IN':
                yield "माफ़ कीजिये, मैं अभी संपर्क नहीं कर पा रहा हूँ। कृपया थोड़ी देर बाद प्रयास करें।"
            else:
                yield "I'm having a little trouble connecting right now. Please try again in a moment."
