const BASE_URL = 'https://take-ai-campus-3.onrender.com';

let authToken: string | null = localStorage.getItem('authToken');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => authToken;

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || error.error || 'Request failed');
  }
  return response.json();
};

export const api = {
  auth: {
    signup: async (username: string, password: string) => {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      return handleResponse(response);
    },

    login: async (username: string, password: string) => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await handleResponse(response);
      if (data.token) {
        setAuthToken(data.token);
      }
      return data;
    },

    logout: () => {
      setAuthToken(null);
    },
  },

  students: {
    getAll: async (page = 1, limit = 10, filters?: { status?: string; search?: string }) => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters?.status) {
        params.append('status', filters.status);
      }

      if (filters?.search) {
        params.append('search', filters.search);
      }

      const response = await fetch(`${BASE_URL}/api/students?${params}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${BASE_URL}/api/students/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      return handleResponse(response);
    },

    create: async (student: {
      name: string;
      status: string;
      isScholarship: boolean;
      attendancePercentage: number;
      assignmentScore: number;
    }) => {
      const response = await fetch(`${BASE_URL}/api/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(student),
      });
      return handleResponse(response);
    },

    update: async (
      id: string,
      student: {
        name?: string;
        status?: string;
        isScholarship?: boolean;
        attendancePercentage?: number;
        assignmentScore?: number;
      }
    ) => {
      const response = await fetch(`${BASE_URL}/api/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(student),
      });
      return handleResponse(response);
    },

    delete: async (id: string) => {
      const response = await fetch(`${BASE_URL}/api/students/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      return handleResponse(response);
    },
  },
};
