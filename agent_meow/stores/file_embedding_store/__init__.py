"""Store for per-image CLIP embeddings (plan 039 phase 2).

The embed worker persists one vector per indexed image; the search path
merges cosine-KNN rank with FTS bm25 (hybrid RRF) so "sunset at the
beach" finds images with zero matching keywords.
"""

from agent_meow.stores.file_embedding_store.sqlalchemy_store import (
    SqlAlchemyFileEmbeddingStore,
)

__all__ = ["SqlAlchemyFileEmbeddingStore"]