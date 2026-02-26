const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface ApiError {
  message: string;
  statusCode: number;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const error: ApiError = await res.json().catch(() => ({
      message: 'Something went wrong',
      statusCode: res.status,
    }));
    throw new Error(error.message || `Request failed (${res.status})`);
  }

  return res.json();
}

export const authApi = {
  login: (payload: LoginPayload) =>
    request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  refresh: (refreshToken: string) =>
    request<{ accessToken: string; refreshToken: string }>(
      '/api/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      },
    ),

  logout: () =>
    request<{ message: string }>('/api/auth/logout', { method: 'POST' }),
};

export const parkingApi = {
  getAll: (page = 1, limit = 20) =>
    request<{ items: unknown[]; total: number }>(
      `/api/parking?page=${page}&limit=${limit}`,
    ),

  getAnalytics: () => request<Record<string, unknown>>('/api/parking/analytics'),
};
