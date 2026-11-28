/**
 * KiranaFlow — Typed HTTP API Client
 * Uses relative `/api/*` paths (proxied via Vite in dev and Nginx in Docker).
 */

import type {
  ConfirmBatchRequest,
  ConfirmBatchResponse,
  ConfirmRequest,
  ConfirmResponse,
  HealthResponse,
  MovementRecord,
  ParseRequest,
  ParseResponse,
  StockAdjustRequest,
  StockAdjustResponse,
  StockSummaryResponse,
} from '../types/api';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let detail = `Server returned ${response.status}`;
    try {
      const errBody = (await response.json()) as { detail?: string };
      if (errBody.detail) detail = errBody.detail;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(detail);
  }

  return (await response.json()) as T;
}

export function fetchHealth(): Promise<HealthResponse> {
  return requestJson<HealthResponse>('/api/health');
}

export function parseVoice(payload: ParseRequest): Promise<ParseResponse> {
  return requestJson<ParseResponse>('/api/voice/parse', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function confirmDelivery(payload: ConfirmRequest): Promise<ConfirmResponse> {
  return requestJson<ConfirmResponse>('/api/deliveries/confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function confirmDeliveryBatch(payload: ConfirmBatchRequest): Promise<ConfirmBatchResponse> {
  return requestJson<ConfirmBatchResponse>('/api/deliveries/confirm-batch', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function adjustStock(payload: StockAdjustRequest): Promise<StockAdjustResponse> {
  return requestJson<StockAdjustResponse>('/api/stock/adjust', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchStock(): Promise<StockSummaryResponse> {
  return requestJson<StockSummaryResponse>('/api/stock');
}

export function fetchMovements(limit = 50): Promise<MovementRecord[]> {
  return requestJson<MovementRecord[]>(`/api/stock/movements?limit=${limit}`);
}
