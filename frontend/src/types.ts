export interface ChunkingOptions {
  method: 'fixed_size' | 'semantic' | 'recursive';
  chunk_size: number;
  chunk_overlap: number;
  semantic_threshold?: number;
  separators?: string[];
}

export interface ProcessingOptions {
  clean_text: boolean;
  generate_summary: boolean;
}

export interface ProcessRequest {
  text: string;
  chunking_options: ChunkingOptions;
  processing_options: ProcessingOptions;
}

export interface Chunk {
  content: string;
  original_index: number;
  summary?: string;
  token_count?: number;
}

export interface ProcessResponse {
  chunks: Chunk[];
  total_chunks: number;
}