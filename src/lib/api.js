const API_BASE = '';

<<<<<<< HEAD
// Fixed Line 3: Added the function name "sendRequest"
async function sendRequest(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  
  // Retrieve security session key from local browser storage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('rentora_token');
    if (token) {
      headers['Authorization'] = token;
    }
  }

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Server request failed.');
  }
  return data;
}

export const api = {
  get: (endpoint) => sendRequest(endpoint, 'GET'),
  post: (endpoint, body) => sendRequest(endpoint, 'POST', body),
  put: (endpoint, body) => sendRequest(endpoint, 'PUT', body),
  delete: (endpoint) => sendRequest(endpoint, 'DELETE')
};
=======
async function handleResponse(res) {
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error.message || `HTTP ${res.status}`);
	}
	return res.json();
}

function getHeaders(hasBody = true) {
	const token =
		typeof localStorage !== 'undefined'
			? localStorage.getItem('token')
			: null;

	const headers = {
		...(token && { Authorization: `Bearer ${token}` })
	};

	if (hasBody) {
		headers['Content-Type'] = 'application/json';
	}

	return headers;
}

const api = {
	get: async (url) => {
		const res = await fetch(`${API_BASE}${url}`, {
			headers: getHeaders(false)
		});
		return handleResponse(res);
	},

	post: async (url, data) => {
		const res = await fetch(`${API_BASE}${url}`, {
			method: 'POST',
			headers: getHeaders(true),
			body: JSON.stringify(data)
		});
		return handleResponse(res);
	},

	put: async (url, data) => {
		const res = await fetch(`${API_BASE}${url}`, {
			method: 'PUT',
			headers: getHeaders(true),
			body: JSON.stringify(data)
		});
		return handleResponse(res);
	},

	delete: async (url) => {
		const res = await fetch(`${API_BASE}${url}`, {
			method: 'DELETE',
			headers: getHeaders(false)
		});
		return handleResponse(res);
	},

	postFormData: async (url, formData) => {
		const token =
			typeof localStorage !== 'undefined'
				? localStorage.getItem('token')
				: null;

		const res = await fetch(`${API_BASE}${url}`, {
			method: 'POST',
			headers: token ? { Authorization: `Bearer ${token}` } : {},
			body: formData
		});

		return handleResponse(res);
	},

	putFormData: async (url, formData) => {
		const token =
			typeof localStorage !== 'undefined'
				? localStorage.getItem('token')
				: null;

		const res = await fetch(`${API_BASE}${url}`, {
			method: 'PUT',
			headers: token ? { Authorization: `Bearer ${token}` } : {},
			body: formData
		});

		return handleResponse(res);
	}
};

api.auth = {
	register: async (userData) => {
		const result = await api.post('/api/auth/register', userData);

		if (result.token) {
			localStorage.setItem('token', result.token);
		}

		return result;
	},

	login: async (email, password) => {
		const result = await api.post('/api/auth/login', {
			email,
			password
		});

		if (result.token) {
			localStorage.setItem('token', result.token);
		}

		return result;
	},

	logout: () => localStorage.removeItem('token'),

	getProfile: () => api.get('/api/auth/profile')
};

api.property = {
	getAll: (status) => {
		const url = status
			? `/api/properties?status=${status}`
			: '/api/properties';

		return api.get(url);
	},

	getMyProperties: () => api.get('/api/properties?mine=true'),

	getById: (id) => api.get(`/api/properties/${id}`),

	create: (formData) => api.postFormData('/api/properties', formData),

	update: (id, formData) =>
		api.putFormData(`/api/properties/${id}`, formData),

	remove: (id) => api.delete(`/api/properties/${id}`)
};

export default api;
export { api };
>>>>>>> main
