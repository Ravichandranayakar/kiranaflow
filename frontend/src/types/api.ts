/**
 * KiranaFlow — TypeScript API Contracts
 * Matches backend/app/models/schemas.py 1:1.
 * Strict typing: zero `any` allowed.
 */

export type LangCode = 'en' | 'hi' | 'kn';
export type InputSource = 'voice' | 'text' | 'demo';

export type FlowState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'NEEDS_CLARIFICATION'
  | 'AWAITING_CONFIRMATION'
  | 'COMMITTED'
  | 'ERROR';

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  database: 'connected' | 'unreachable';
  llm_parser: string;
  default_language: LangCode;
}

export interface Candidate {
  product_id: number;
  product_name: string;
}

export interface PendingDraft {
  product_id: number | null;
  product_name: string | null;
  received: number | null;
  damaged: number | null;
  usable: number | null;
  unit: string | null;
  awaiting_confirmation: boolean;
  was_corrected: boolean;
  idempotency_key: string | null;
  pending_question_kind: string | null;
  candidates: Candidate[] | null;
  teen_tens_options: number[] | null;
  queued_clauses?: string[] | null;
  queued_entries?: PendingEntry[] | null;
}

export interface PendingEntry {
  product_id: number;
  product_name: string;
  received: number;
  damaged: number;
  usable: number;
  unit: string;
  idempotency_key: string;
}

export interface ParseRequest {
  transcript: string;
  draft: PendingDraft;
  lang: LangCode;
  source: InputSource;
}

export interface ParseResponse {
  status: 'complete' | 'clarify' | 'unknown' | 'error';
  entry: PendingEntry | null;
  entries?: PendingEntry[] | null;
  question: string | null;
  question_kind: string | null;
  candidates: Candidate[] | null;
  draft: PendingDraft;
  action: 'none' | 'confirm' | 'cancel';
  readback_text: string | null;
  raw_transcript: string | null;
}

export interface ConfirmRequest {
  entry: PendingEntry;
  raw_transcript: string;
  lang: LangCode;
  source: InputSource;
  was_corrected: boolean;
}

export interface ConfirmResponse {
  status: 'committed' | 'duplicate' | 'error';
  message: string;
  movement_id: number | null;
  product_name: string | null;
  usable_stock: number | null;
  damaged_stock: number | null;
}

export interface ConfirmBatchRequest {
  entries: PendingEntry[];
  raw_transcript: string;
  lang: LangCode;
  source: InputSource;
  was_corrected: boolean;
}

export interface ConfirmBatchResponse {
  status: 'committed' | 'duplicate' | 'error';
  message: string;
  results: ConfirmResponse[];
}

export interface StockAdjustRequest {
  product_id: number;
  usable_delta: number;
  damaged_delta: number;
  reason: string;
}

export interface StockAdjustResponse {
  status: 'adjusted' | 'error';
  message: string;
  product_id: number;
  product_name: string;
  usable_stock: number;
  damaged_stock: number;
  movement_id: number;
}

export interface StockItem {
  product_id: number;
  product_name: string;
  category: string;
  usable_stock: number;
  damaged_stock: number;
  min_threshold: number;
  is_low: boolean;
}

export interface StockSummaryResponse {
  items: StockItem[];
  low_stock_count: number;
}

export interface MovementRecord {
  id: number;
  product_name: string;
  received: number;
  damaged: number;
  usable_delta: number;
  raw_transcript: string | null;
  lang: string;
  source: string;
  was_corrected: boolean;
  confirmed_at: string;
}

export const EMPTY_DRAFT: PendingDraft = {
  product_id: null,
  product_name: null,
  received: null,
  damaged: null,
  usable: null,
  unit: null,
  awaiting_confirmation: false,
  was_corrected: false,
  idempotency_key: null,
  pending_question_kind: null,
  candidates: null,
  teen_tens_options: null,
};
