import logging
import google.generativeai as genai
from flask import current_app

logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self):
        self.provider = current_app.config.get('LLM_PROVIDER', 'gemini')
        self.api_key = current_app.config.get('GEMINI_API_KEY')
        self.model_name = current_app.config.get('GEMINI_MODEL', 'gemini-2.5-flash')
        
        if self.provider == 'gemini':
            if not self.api_key:
                logger.error("GEMINI_API_KEY is missing")
            else:
                genai.configure(api_key=self.api_key)

    def generate_reply(self, user_text, language='en'):
        """
        Generates a reply using the configured LLM provider.
        """
        system_prompt = self._build_system_prompt(language)
        
        try:
            if self.provider == 'gemini':
                return self._call_gemini(system_prompt, user_text, language)
            else:
                logger.error(f"Unknown LLM provider: {self.provider}")
                return self._fallback_response(language)
        except Exception as e:
            logger.error(f"LLM Unexpected error: {e}")
            return self._fallback_response(language)

    def _build_system_prompt(self, language):
        base_prompt = """
You are EmotiCare, a supportive chat companion (not a therapist).
Sound warm and human, but not sugary, flirty, or roleplay.

Hard rules:
- Never use pet names or endearments: honey, sweetie, dear, babe, love
- Never reply with only a greeting or filler like: hi, hey, hello, ok, hmm
- Do not say: "I'm sorry to hear that"
- No emojis
- No clinical/medical language, no diagnoses
- Be specific to what the user said (no generic lines)

Length + structure:
- EXACTLY 2 sentences total.
- Sentence 1: quick validation + one concrete next step (or tiny reframe).
- Sentence 2: ask EXACTLY ONE question that helps you help them.

If the user message is too short/unclear:
- Still follow the 2-sentence format and ask a clarifying question in sentence 2.
"""
        if language == 'hi' or language == 'hi-IN':
            return base_prompt + "\nIMPORTANT: Respond in Hindi (Devenagari script). Keep it casual and short."
        else:
            return base_prompt + "\nIMPORTANT: Respond in English."

    def _call_gemini(self, system_prompt, user_text, language):
        if not self.api_key:
            logger.error("Cannot call Gemini: Missing API Key")
            return self._fallback_response(language)
            
        try:
            model = genai.GenerativeModel(self.model_name)
            
            # Combine system prompt and user text as Gemini often handles instructions better this way
            # or we could use 'system_instruction' in newer SDK versions if available.
            # For robustness, we'll combine them.
            full_prompt = f"{system_prompt}\n\nUser: {user_text}\n"
            
            # Set generation config for short responses
            generation_config = genai.types.GenerationConfig( # Approx 1-2 sentences
                temperature=0.5
            )
            
            response = model.generate_content(
                full_prompt,
                generation_config=generation_config
            )
            
            if response.text:
                return response.text.strip()
            else:
                logger.warning("Gemini returned empty response")
                return self._fallback_response(language)
                
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            return self._fallback_response(language)

    def _fallback_response(self, language):
        if language == 'hi' or language == 'hi-IN':
            return "माफ़ कीजिये, मैं अभी संपर्क नहीं कर पा रहा हूँ। कृपया थोड़ी देर बाद प्रयास करें।"
        return "I'm having a little trouble connecting right now. Please try again in a moment."