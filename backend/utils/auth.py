import os
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

def get_embedding(text):
    try:
        response = openai.Embedding.create(model="text-embedding-ada-002", input=text)
        return response['data'][0]['embedding']
    except Exception as e:
        print(f"Embedding error: {e}")
        return [0.0] * 1536
