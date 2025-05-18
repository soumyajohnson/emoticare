from openai import OpenAI

# Insert your API key here
client = OpenAI(api_key="your-openai-api-key")

def chat_with_gpt(user_input):
    system_prompt = """
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

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ]
    )
    return response.choices[0].message.content.strip()
