import { useAuth } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token: string },
): Promise<T> {
  const { token, ...rest } = options;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...rest.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// Hook for authenticated API calls
export function useApi() {
  const { getToken } = useAuth();

  const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    return apiRequest<T>(path, { ...options, token });
  };

  return { request };
}
