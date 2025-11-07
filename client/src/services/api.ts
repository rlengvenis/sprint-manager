const API_BASE_URL = 'http://localhost:5001/api';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  health: () => fetchAPI('/health'),
  
  // Team endpoints
  teams: {
    getAll: () => fetchAPI('/teams'),
    getById: (id: string) => fetchAPI(`/teams/${id}`),
    getDefault: () => fetchAPI('/teams/default'),
    create: (data: any) => fetchAPI('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    setDefault: (id: string) => fetchAPI(`/teams/${id}/default`, {
      method: 'PATCH',
    }),
  },
};

