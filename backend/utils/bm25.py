from rank_bm25 import BM25Okapi
import re

class BM25Search:
    def __init__(self):
        self.bm25 = None
        self.documents = []
    
    def build_index(self, documents):
        self.documents = documents
        tokenized_docs = [self.tokenize(doc) for doc in documents]
        self.bm25 = BM25Okapi(tokenized_docs)
    
    def tokenize(self, text):
        return re.findall(r'\b\w+\b', text.lower())
    
    def search(self, query, top_k=5):
        if not self.bm25:
            return []
        
        tokenized_query = self.tokenize(query)
        scores = self.bm25.get_scores(tokenized_query)
        top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:top_k]
        
        return [
            {
                "id": str(i),
                "text": self.documents[i],
                "score": scores[i]
            }
            for i in top_indices
        ]

# Global BM25 instance
bm25_searcher = BM25Search()

def bm25_search(user_id, query, top_k=5):
    # In a real implementation, you'd load user-specific documents
    # For now, return empty results
    return []