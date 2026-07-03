const BASE_URL = 'http://localhost:5000/api';

// Shared utility helper to perform standard JSON API fetches
async function sendRequest(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  
  // Retrieve token from browser localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('rentora_token');
    if (token) {
      headers['Authorization'] = token; // Sends "Bearer <token>" header automatically
    }
  }

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong with the API request.');
  }
  return data;
}

export const api = {
  get: (endpoint) => sendRequest(endpoint, 'GET'),
  post: (endpoint, body) => sendRequest(endpoint, 'POST', body),
  put: (endpoint, body) => sendRequest(endpoint, 'PUT', body),
  delete: (endpoint) => sendRequest(endpoint, 'DELETE')
};
