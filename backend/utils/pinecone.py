import pinecone
import os

# Initialize Pinecone only if API key is available
pinecone_initialized = False
index = None

def init_pinecone():
    global pinecone_initialized, index
    if pinecone_initialized:
        return
    
    api_key = os.getenv("PINECONE_API_KEY")
    environment = os.getenv("PINECONE_ENVIRONMENT", "us-east4-gcp")
    
    if not api_key:
        print("Warning: PINECONE_API_KEY not found. Pinecone features will be disabled.")
        return
    
    try:
        # Use the new Pinecone client (serverless)
        from pinecone import Pinecone
        pc = Pinecone(api_key=api_key)
        
        index_name = "mental-wellness-vectors"
        
        # Create index if it doesn't exist (serverless)
        if index_name not in [idx.name for idx in pc.list_indexes()]:
            pc.create_index(
                name=index_name,
                dimension=1536,
                metric="cosine",
                spec={
                    "serverless": {
                        "cloud": "aws",
                        "region": "us-east-1"
                    }
                }
            )
        
        index = pc.Index(index_name)
        pinecone_initialized = True
        print("Pinecone initialized successfully (serverless)")
    except Exception as e:
        print(f"Warning: Failed to initialize Pinecone: {e}")
        print("Pinecone features will be disabled.")

# Initialize on import
init_pinecone()

def _namespace_for_user(user_id):
    return f"user-{user_id}"

def upsert_embedding(user_id, embedding, metadata):
    if not pinecone_initialized or not index:
        print("Pinecone not available, skipping upsert")
        return
    
    # Use mood ID as vector ID, or generate a unique ID if not available
    vector_id = metadata.get('mood_id', f"mood-{user_id}-{metadata.get('timestamp', 'unknown')}")
    ns = _namespace_for_user(user_id)
    
    try:
        index.upsert(vectors=[(vector_id, embedding, metadata)], namespace=ns)
        print(f"Successfully stored vector {vector_id} in Pinecone for user {user_id}")
    except Exception as e:
        print(f"Error upserting to Pinecone: {e}")

def query_similar(user_id, embedding, top_k=5):
    if not pinecone_initialized or not index:
        print("Pinecone not available, returning empty results")
        return []
    ns = _namespace_for_user(user_id)
    result = index.query(vector=embedding, top_k=top_k, include_metadata=True, namespace=ns)
    return result.get("matches", [])