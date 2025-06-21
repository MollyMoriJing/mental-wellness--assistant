from services.vectorstore import vector_db_query
from utils.bm25 import bm25_search

# Combine semantic and lexical similarity results
def retrieve_context(user_id, query_embedding):
    bm25_docs = bm25_search(user_id, query_embedding)
    vector_hits = vector_db_query(query_embedding)
    return merge_results(bm25_docs, vector_hits)

def merge_results(bm25_docs, vector_hits):
    doc_set = set()
    combined = []
    for doc in bm25_docs + vector_hits:
        if doc['id'] not in doc_set:
            doc_set.add(doc['id'])
            combined.append(doc['text'])
    return combined[:5]
