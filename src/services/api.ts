// Cliente HTTP de Comunicação com o Backend PostgreSQL do Sentinela

const API_BASE = import.meta.env.VITE_API_BASE || '';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const url = `${API_BASE}${endpoint}`;
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      console.warn(`[Sentinela API] Erro HTTP ${response.status} em ${endpoint}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (err) {
    console.warn(`[Sentinela API] Falha de conexão com backend em ${endpoint}:`, err);
    return null;
  }
}
