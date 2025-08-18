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

def _namespace_for_user(user_id):
    return f"user-{user_id}"

def upsert_embedding(user_id, embedding, metadata):
    vector_id = metadata.get('label', 'doc')
    ns = _namespace_for_user(user_id)
    index.upsert(vectors=[(vector_id, embedding, metadata)], namespace=ns)

def query_similar(user_id, embedding, top_k=5):
    ns = _namespace_for_user(user_id)
    result = index.query(vector=embedding, top_k=top_k, include_metadata=True, namespace=ns)
    return result.get("matches", [])