from backend.utils.bm25 import bm25_search
from backend.utils.pinecone import query_similar
from backend.utils.auth import get_embedding

def retrieve_context(user_id, query_text):
    embedding = get_embedding(query_text)
    bm25_docs = bm25_search(user_id, query_text)
    vector_matches = query_similar(user_id, embedding)
    vector_hits = [
        {"id": m.get("id", ""), "text": m.get("metadata", {}).get("text", ""), "score": m.get("score", 0.0)}
        for m in vector_matches
    ]
    return merge_results(bm25_docs, vector_hits)

def merge_results(bm25_docs, vector_hits):
    doc_set = set()
    combined = []
    for doc in bm25_docs + vector_hits:
        doc_id = doc.get('id')
        if doc_id not in doc_set:
            doc_set.add(doc_id)
            combined.append(doc.get('text', ''))
    return combined[:5]
