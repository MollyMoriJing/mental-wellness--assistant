import pinecone
import os

# Initialize Pinecone
pinecone.init(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment=os.getenv("PINECONE_ENV", "us-west1-gcp")
)

index_name = "mental-health-context"

def vector_db_query(query_embedding, top_k=5):
    try:
        if index_name not in pinecone.list_indexes():
            pinecone.create_index(index_name, dimension=1536)
        
        index = pinecone.Index(index_name)
        results = index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )
        
        return [
            {
                "id": match["id"],
                "text": match["metadata"].get("text", ""),
                "score": match["score"]
            }
            for match in results["matches"]
        ]
    except Exception as e:
        print(f"Vector search error: {e}")
        return []