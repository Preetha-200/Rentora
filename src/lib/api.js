// src/lib/api.js
const API_BASE = 'http://localhost:5000';

async function handleResponse(res) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

function getHeaders(hasBody = true) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

// ─── Generic HTTP methods ─────────────────────────
const api = {
  get: async (url) => {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },
  post: async (url, data) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  put: async (url, data) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  delete: async (url) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'DELETE',
      headers: getHeaders(false),
    });
    return handleResponse(res);
  },
  // For FormData (multipart) – separate method
  postFormData: async (url, formData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return handleResponse(res);
  },
  putFormData: async (url, formData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return handleResponse(res);
  },
};

// ─── Auth API (convenience) ───────────────────────
api.auth = {
  register: async (userData) => {
    const result = await api.post('/api/auth/register', userData);
    if (result.token) localStorage.setItem('token', result.token);
    return result;
  },
  login: async (email, password) => {
    const result = await api.post('/api/auth/login', { email, password });
    if (result.token) localStorage.setItem('token', result.token);
    return result;
  },
  logout: () => localStorage.removeItem('token'),
  getProfile: () => api.get('/api/auth/profile'),
};

// ─── Property API (convenience) ──────────────────
api.property = {
  getAll: (status) => {
    const url = status ? `/api/properties?status=${status}` : '/api/properties';
    return api.get(url);
  },
  getMyProperties: async () => {
    const response = await api.get('/api/properties/my');
    console.log('My Properties API Response:', response);
    return response;
  },
  getById: (id) => api.get(`/api/properties/${id}`),
  create: (formData) => api.postFormData('/api/properties', formData),
  update: (id, formData) => api.putFormData(`/api/properties/${id}`, formData),
  remove: (id) => api.delete(`/api/properties/${id}`),
};

export default api;
export { api };