import { auth } from './firebase';

const API_BASE = '';

// Wait for Firebase auth state to restore before making authenticated requests
let resolveAuthReady;
const authReady = new Promise((resolve) => {
	resolveAuthReady = resolve;
});
auth.onAuthStateChanged(() => resolveAuthReady());

async function getFreshToken() {
	await authReady;
	if (!auth.currentUser) return null;
	try {
		return await auth.currentUser.getIdToken();
	} catch {
		return null;
	}
}

async function handleResponse(res) {
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error.message || `HTTP ${res.status}`);
	}
	return res.json();
}

async function getHeaders(hasBody = true) {
	const token = await getFreshToken();
	const headers = {
		...(token && { Authorization: `Bearer ${token}` })
	};
	if (hasBody) headers['Content-Type'] = 'application/json';
	return headers;
}

const api = {
	get: async (url) => {
		const res = await fetch(`${API_BASE}${url}`, { headers: await getHeaders(false) });
		return handleResponse(res);
	},

	post: async (url, data) => {
		const res = await fetch(`${API_BASE}${url}`, {
			method: 'POST',
			headers: await getHeaders(true),
			body: JSON.stringify(data)
		});
		return handleResponse(res);
	},

	put: async (url, data) => {
		const res = await fetch(`${API_BASE}${url}`, {
			method: 'PUT',
			headers: await getHeaders(true),
			body: JSON.stringify(data)
		});
		return handleResponse(res);
	},

	patch: async (url, data) => {
		const res = await fetch(`${API_BASE}${url}`, {
			method: 'PATCH',
			headers: await getHeaders(true),
			body: JSON.stringify(data)
		});
		return handleResponse(res);
	},

	delete: async (url, data) => {
		const res = await fetch(`${API_BASE}${url}`, {
			method: 'DELETE',
			headers: await getHeaders(!!data),
			...(data && { body: JSON.stringify(data) })
		});
		return handleResponse(res);
	},

	postFormData: async (url, formData) => {
		const token = await getFreshToken();
		const res = await fetch(`${API_BASE}${url}`, {
			method: 'POST',
			headers: token ? { Authorization: `Bearer ${token}` } : {},
			body: formData
		});
		return handleResponse(res);
	},

	putFormData: async (url, formData) => {
		const token = await getFreshToken();
		const res = await fetch(`${API_BASE}${url}`, {
			method: 'PUT',
			headers: token ? { Authorization: `Bearer ${token}` } : {},
			body: formData
		});
		return handleResponse(res);
	}
};

// Auth namespace — no longer stores tokens in localStorage
api.auth = {
	register: (userData) => api.post('/api/auth/register', userData),
	logout: () => fetch('/api/auth/session', { method: 'DELETE' }),
	getProfile: () => api.get('/api/auth/profile')
};

api.property = {
	getAll: (status) => {
		const url = status ? `/api/properties?status=${status}` : '/api/properties';
		return api.get(url);
	},
	getMyProperties: () => api.get('/api/properties?mine=true'),
	getById: (id) => api.get(`/api/properties/${id}`),
	create: (formData) => api.postFormData('/api/properties', formData),
	update: (id, formData) => api.putFormData(`/api/properties/${id}`, formData),
	remove: (id) => api.delete(`/api/properties/${id}`)
};

export default api;
export { api };
