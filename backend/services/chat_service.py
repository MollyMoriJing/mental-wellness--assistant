import openai
import os
from services.vectorstore import vector_db_query
from utils.embed import get_embedding

openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_response(user_input):
    try:
        embedded = get_embedding(user_input)
        context_docs = vector_db_query(embedded)
        context_text = "\n".join([doc.get("text", "") for doc in context_docs])

        prompt = f"""
        You are a mental health assistant. Use the following context to respond helpfully:
        ---
        {context_text}
        ---
        User: {user_input}
        Assistant:
        """

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        # Fallback response if OpenAI fails
        return "I understand you're reaching out. While I'm having technical difficulties right now, please know that your mental health is important. Consider speaking with a professional counselor if you need immediate support."
