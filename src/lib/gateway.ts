/**
 * gateway.ts - Clawdbot Gateway API client
 * Wraps the local Clawdbot gateway at http://127.0.0.1:18789
 */

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://127.0.0.1:18789';
const GATEWAY_TOKEN =
  process.env.GATEWAY_TOKEN ||
  'eb79d9c9975a67bfd172354535e5ad2626e917f5cf77e088';

const TIMEOUT_MS = 5000;

async function gatewayFetch<T>(path: string): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(`${GATEWAY_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${GATEWAY_TOKEN}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[gateway] HTTP ${res.status} for ${path}`);
      return null;
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.warn(`[gateway] Non-JSON response for ${path}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      console.warn(`[gateway] Timeout fetching ${path}`);
    } else {
      console.warn(`[gateway] Error fetching ${path}:`, (err as Error).message);
    }
    return null;
  }
}

// ─── Types for Gateway responses ─────────────────────────────────────────────

export interface GatewaySession {
  id: string;
  label?: string;
  status?: string;
  model?: string;
  created_at?: string;
  last_active?: string;
  current_task?: string;
  agent_type?: string;
  session_key?: string;
}

export interface GatewayStatus {
  status: string;
  uptime?: number;
  version?: string;
  sessions?: GatewaySession[];
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * List active sessions/agents from the gateway.
 * Returns [] if the gateway is unavailable.
 */
export async function getGatewaySessions(): Promise<GatewaySession[]> {
  // The gateway's /api/sessions endpoint returns session list
  const data = await gatewayFetch<GatewaySession[]>('/api/sessions');
  if (!Array.isArray(data)) return [];
  return data;
}

/**
 * Get gateway status / health.
 */
export async function getGatewayStatus(): Promise<GatewayStatus | null> {
  return gatewayFetch<GatewayStatus>('/api/status');
}

/**
 * Check if the gateway is reachable.
 */
export async function isGatewayAvailable(): Promise<boolean> {
  const result = await gatewayFetch<unknown>('/api/status');
  return result !== null;
}
