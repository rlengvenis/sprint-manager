import type { Team, Sprint } from '../types';

// In production (Heroku), use relative path since frontend is served from same origin
// In development, use env variable or localhost
const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api');

type TeamInput = Omit<Team, 'id' | 'createdAt'>;
type SprintInput = Omit<Sprint, 'id' | 'createdAt' | 'completedAt'> & { 
  completedAt?: Date | null;
};

// Transform MongoDB _id to id for consistency
function normalizeIds<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(normalizeIds) as T;
  }
  if (obj && typeof obj === 'object') {
    const normalized: Record<string, unknown> = {};
    for (const key in obj) {
      if (key === '_id') {
        normalized.id = obj[key];
      } else if (key === 'members' || key === 'memberAvailability') {
        normalized[key] = normalizeIds(obj[key]);
      } else {
        normalized[key] = obj[key];
      }
    }
    return normalized as T;
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
  
  // Team endpoints (single team only)
  teams: {
    get: () => fetchAPI('/teams'),
    create: (data: TeamInput) => fetchAPI('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (data: TeamInput) => fetchAPI('/teams', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  },

  // Sprint endpoints
  sprints: {
    getAll: () => fetchAPI('/sprints'),
    getById: (id: string) => fetchAPI(`/sprints/${id}`),
    getCurrent: () => fetchAPI('/sprints/current'),
    getHistory: () => fetchAPI('/sprints/history'),
    create: (data: SprintInput) => fetchAPI('/sprints', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    complete: (id: string, actualVelocity: number) => fetchAPI(`/sprints/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ actualVelocity }),
    }),
  },
};

