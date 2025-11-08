const API_BASE_URL = 'http://localhost:5001/api';

// Transform MongoDB _id to id for consistency
function normalizeIds(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(normalizeIds);
  }
  if (obj && typeof obj === 'object') {
    const normalized: any = {};
    for (const key in obj) {
      if (key === '_id') {
        normalized.id = obj[key];
      } else if (key === 'members' || key === 'memberAvailability') {
        normalized[key] = normalizeIds(obj[key]);
      } else {
        normalized[key] = obj[key];
      }
    }
    return normalized;
  }
  return obj;
}

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

  const data = await response.json();
  return normalizeIds(data);
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

  // Sprint endpoints
  sprints: {
    getAll: (teamId?: string) => {
      const query = teamId ? `?teamId=${teamId}` : '';
      return fetchAPI(`/sprints${query}`);
    },
    getById: (id: string) => fetchAPI(`/sprints/${id}`),
    getCurrent: (teamId: string) => fetchAPI(`/sprints/current?teamId=${teamId}`),
    getHistory: (teamId: string) => fetchAPI(`/sprints/history?teamId=${teamId}`),
    create: (data: any) => fetchAPI('/sprints', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    complete: (id: string, actualVelocity: number) => fetchAPI(`/sprints/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ actualVelocity }),
    }),
  },
};

