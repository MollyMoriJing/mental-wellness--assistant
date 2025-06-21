from services.vectorstore import vector_db_query
from utils.bm25 import bm25_search

def retrieve_context(user_id, query_embedding):
    try:
        bm25_docs = bm25_search(user_id, query_embedding)
        vector_hits = vector_db_query(query_embedding)
        return merge_results(bm25_docs, vector_hits)
    except Exception as e:
        print(f"Context retrieval error: {e}")
        return []

def merge_results(bm25_docs, vector_hits):
    doc_set = set()
    combined = []
    
    for doc in (bm25_docs + vector_hits):
        doc_id = doc.get('id', '')
        if doc_id not in doc_set:
            doc_set.add(doc_id)
            combined.append(doc.get('text', ''))
    
    return combined[:5]