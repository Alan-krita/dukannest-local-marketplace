// src/services/api.js
// Central API service with safe error handling

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

// Get stored JWT token
function getToken() {
  return localStorage.getItem('localmart_token');
}

// Build headers with optional auth
function buildHeaders(auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Core request helper
async function request(method, path, { body, auth = false, params } = {}) {
  let url = `${API_BASE}${path}`;

  // Append query params
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') searchParams.append(k, v);
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const options = {
    method,
    headers: buildHeaders(auth),
  };
  if (body) options.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(url, options);
  } catch (netErr) {
    throw new Error('Backend server is currently offline or unreachable. Running in demo mode.');
  }

  // Handle 204 No Content
  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    if (data) {
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        message = data.detail.map(d => d.msg || (typeof d === 'string' ? d : JSON.stringify(d))).join(', ');
      } else if (data.detail && typeof data.detail === 'object') {
        message = data.detail.msg || data.detail.message || JSON.stringify(data.detail);
      } else if (typeof data.message === 'string') {
        message = data.message;
      }
    }
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Convenience wrappers
export const api = {
  get: (path, options) => request('GET', path, options),
  post: (path, options) => request('POST', path, options),
  patch: (path, options) => request('PATCH', path, options),
  delete: (path, options) => request('DELETE', path, options),
  put: (path, options) => request('PUT', path, options),
};

export default api;
