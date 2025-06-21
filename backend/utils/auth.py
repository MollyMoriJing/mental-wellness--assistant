import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

SYSTEM_PROMPT = """
You are a caring wellness assistant. Use supportive, encouraging language. Refer to the following context when helpful:
{context}
"""

def get_embedding(text):
    try:
        response = openai.Embedding.create(
            model="text-embedding-ada-002",
            input=text
        )
        return response['data'][0]['embedding']
    except Exception as e:
        print(f"Embedding error: {e}")
        # Return dummy embedding for development
        return [0.0] * 1536

def generate_response_with_context(message, context):
    prompt = SYSTEM_PROMPT.format(context="\n".join(context))
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": message}
        ],
        temperature=0.7
    )
    return response.choices[0].message["content"]
