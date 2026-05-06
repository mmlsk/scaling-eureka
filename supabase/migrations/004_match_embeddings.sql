-- Create function to search for similar embeddings using cosine distance
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding vector(1536),
  match_user_id UUID,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  source_type TEXT,
  source_id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    note_embeddings.id,
    note_embeddings.source_type,
    note_embeddings.source_id,
    note_embeddings.content,
    1 - (note_embeddings.embedding <=> query_embedding) AS similarity
  FROM note_embeddings
  WHERE note_embeddings.user_id = match_user_id
  ORDER BY note_embeddings.embedding <=> query_embedding ASC
  LIMIT match_count;
$$;
