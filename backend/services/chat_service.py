import openai
import os
from backend.services.recommender import retrieve_context
import requests

openai.api_key = os.getenv("OPENAI_API_KEY")


def generate_response(user_id, user_input):
    try:
        contexts = retrieve_context(user_id, user_input)
        context_text = "\n".join(contexts)

        prompt = (
            "You are a mental health assistant. "
            "Use the following context to respond helpfully:\n"
            "---\n"
            f"{context_text}\n"
            "---\n"
            f"User: {user_input}\n"
            "Assistant:"
        )

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            request_timeout=20,
        )
        return response.choices[0].message["content"].strip()
    except Exception:
        fallback = (
            "I understand you're reaching out. While I'm having technical "
            "difficulties right now, please know that your mental health "
            "is important. Consider speaking with a professional counselor "
            "if you need immediate support."
        )
        return fallback
