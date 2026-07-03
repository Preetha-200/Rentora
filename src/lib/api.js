const BASE_URL = 'http://localhost:5000/api';

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