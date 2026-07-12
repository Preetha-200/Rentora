import { auth } from './firebase';

const API_BASE = '';

// Firebase's client SDK auto-refreshes the underlying token roughly every
// hour, but only once `auth.currentUser` exists — right after a hard page
// reload there's a brief window where auth state is still restoring from
// storage. `authReady` resolves the first time Firebase reports auth state,
// so every request waits for that instead of racing it.
let resolveAuthReady;
const authReady = new Promise((resolve) => {
	resolveAuthReady = resolve;
});
auth.onAuthStateChanged(() => resolveAuthReady());

async function getFreshToken() {
	await authReady;

	if (!auth.currentUser) return null;

	// getIdToken() (without force-refresh) returns the cached token if it
	// still has life left, and transparently fetches a new one from Firebase
	// if it's expired or close to expiring — this is what actually fixes
	// "auth/id-token-expired", instead of relying on a token string that was
	// written to localStorage once at login and never touched again.
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

	if (hasBody) {
		headers['Content-Type'] = 'application/json';
	}

	return headers;
}

const api = {
	get: async (url) => {
		const res = await fetch(`${API_BASE}${url}`, {
			headers: await getHeaders(false)
		});
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
