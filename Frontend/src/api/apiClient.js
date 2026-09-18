// Central API client for RoadSense Backend

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';


export const getAuthToken = () => {
  return localStorage.getItem('roadsense_auth_token') || null;
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('roadsense_auth_token', token);
  } else {
    localStorage.removeItem('roadsense_auth_token');
  }
};

export async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If sending JSON body and content-type not set, set application/json
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Fastify uses cookies as well
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMsg = data?.error || data?.message || `HTTP Error ${response.status}`;
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg.map((item) => item.message || JSON.stringify(item)).join(', ');
      } else if (typeof errorMsg !== 'string') {
        errorMsg = JSON.stringify(errorMsg);
      }
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    // If backend connection refused / DB down, tag error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      error.isNetworkError = true;
      error.message = 'Backend server is unreachable or offline';
    }
    throw error;
  }
}
