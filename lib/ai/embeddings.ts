import type { SupabaseClient } from '@supabase/supabase-js';
import type { NoteEmbedding } from '@/types/database';

// ── OpenAI Embedding Response Shape ──
interface OpenAIEmbeddingResponse {
  data: {
    embedding: number[];
    index: number;
    object: string;
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

// ── Similarity Search Result ──
export interface SimilarityResult {
  id: string;
  sourceType: NoteEmbedding['source_type'];
  sourceId: string | null;
  content: string;
  similarity: number;
}

/**
 * Generate an embedding vector for the given text using OpenAI's text-embedding-ada-002 model.
 */
export async function generateEmbedding(
  text: string,
  apiKey: string,
): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text.slice(0, 8000), // Respect token limits by truncating
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`OpenAI embedding API failed: ${res.status} ${errorBody}`);
  }

  const data: OpenAIEmbeddingResponse = await res.json();

  if (!data.data?.[0]?.embedding) {
    throw new Error('OpenAI returned no embedding data');
  }

  return data.data[0].embedding;
}

/**
 * Search for similar content using cosine similarity on stored note embeddings.
 * Uses Supabase's pgvector extension for efficient vector search.
 */
export async function searchSimilar(
  embedding: number[],
  userId: string,
  supabase: SupabaseClient,
  limit: number = 5,
): Promise<SimilarityResult[]> {
  // Use Supabase RPC to call a pgvector cosine similarity search
  // The embedding column uses vector_cosine_ops, so we use <=> for cosine distance
  const { data, error } = await supabase.rpc('match_embeddings', {
    query_embedding: embedding,
    match_user_id: userId,
    match_count: limit,
  });

  if (error) {
    // Fallback: direct query if RPC is not set up
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('note_embeddings')
      .select('id, source_type, source_id, content, embedding')
      .eq('user_id', userId)
      .limit(limit * 3); // Fetch more since we need to sort by similarity

    if (fallbackError) {
      throw new Error(`Supabase similarity search failed: ${fallbackError.message}`);
    }

    if (!fallbackData || fallbackData.length === 0) {
      return [];
    }

    // Manual cosine similarity calculation
    const withSimilarity = fallbackData.map((row: {
      id: string;
      source_type: NoteEmbedding['source_type'];
      source_id: string | null;
      content: string;
      embedding: number[];
    }) => {
      const sim = cosineSimilarity(embedding, row.embedding);
      return {
        id: row.id,
        sourceType: row.source_type,
        sourceId: row.source_id,
        content: row.content,
        similarity: sim,
      };
    });

    withSimilarity.sort((a, b) => b.similarity - a.similarity);
    return withSimilarity.slice(0, limit);
  }

  const results: SimilarityResult[] = (data as {
    id: string;
    source_type: NoteEmbedding['source_type'];
    source_id: string | null;
    content: string;
    similarity: number;
  }[]).map((row) => ({
    id: row.id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    content: row.content,
    similarity: row.similarity,
  }));

  return results;
}

/**
 * Generate and store an embedding for user content.
 * If an embedding already exists for the same source_type/source_id, it will be updated.
 */
export async function upsertEmbedding(
  userId: string,
  sourceType: NoteEmbedding['source_type'],
  sourceId: string | null,
  content: string,
  supabase: SupabaseClient,
  apiKey: string,
): Promise<void> {
  const embedding = await generateEmbedding(content, apiKey);

  if (sourceId) {
    // Check for existing embedding with same source
    const { data: existing } = await supabase
      .from('note_embeddings')
      .select('id')
      .eq('user_id', userId)
      .eq('source_type', sourceType)
      .eq('source_id', sourceId)
      .limit(1)
      .single();

    if (existing) {
      const { error: updateError } = await supabase
        .from('note_embeddings')
        .update({
          content,
          embedding,
          created_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        throw new Error(`Failed to update embedding: ${updateError.message}`);
      }
      return;
    }
  }

  const { error: insertError } = await supabase
    .from('note_embeddings')
    .insert({
      user_id: userId,
      source_type: sourceType,
      source_id: sourceId,
      content,
      embedding,
    });

  if (insertError) {
    throw new Error(`Failed to insert embedding: ${insertError.message}`);
  }
}

/**
 * Compute cosine similarity between two vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}
