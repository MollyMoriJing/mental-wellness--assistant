import pinecone
import os

# Initialize Pinecone
pinecone.init(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment=os.getenv("PINECONE_ENVIRONMENT", "us-east4-gcp")
)

index_name = "mental-wellness-vectors"

# Create index if it doesn't exist
if index_name not in pinecone.list_indexes():
    pinecone.create_index(index_name, dimension=1536)

index = pinecone.Index(index_name)

def upsert_embedding(user_id, embedding, metadata):
    vector_id = f"{user_id}:{metadata.get('label', 'doc')}"
    index.upsert([(vector_id, embedding, metadata)])

def query_similar(embedding, top_k=5):
    result = index.query(vector=embedding, top_k=top_k, include_metadata=True)
    return result["matches"]