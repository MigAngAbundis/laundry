// src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Helper function to get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper function to make API requests
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response;
};

