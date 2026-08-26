/**
 * JWT Authenticated API Client Wrapper
 * Centralized API service handling JWT headers, base URLs, and file upload endpoints.
 */

export const API_BASE_URL = 'http://localhost:8081/api';

export const getAuthToken = () => {
  return localStorage.getItem('twin_jwt_token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('twin_jwt_token', token);
  } else {
    localStorage.removeItem('twin_jwt_token');
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('twin_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

export const setCurrentUser = (userData) => {
  if (userData) {
    localStorage.setItem('twin_user', JSON.stringify(userData));
    if (userData.accessToken) {
      setAuthToken(userData.accessToken);
    }
  } else {
    localStorage.removeItem('twin_user');
    localStorage.removeItem('twin_jwt_token');
  }
};

export async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    console.warn('[API Auth] Session expired or unauthorized request.');
  }

  return response;
}

export async function uploadModelApi(formData) {
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/v1/models/upload-skp`, {
    method: 'POST',
    headers,
    body: formData
  });

  return response.json();
}
