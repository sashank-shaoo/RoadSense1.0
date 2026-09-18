import { request, setAuthToken } from './apiClient.js';

export const authApi = {
  // Citizen Registration
  async register(userData) {
    const payload = {
      name: userData.name?.trim(),
      email: userData.email?.trim().toLowerCase(),
      password: userData.password,
    };
    if (userData.phone?.trim()) payload.phone = userData.phone.trim();
    if (userData.occupation?.trim()) payload.occupation = userData.occupation.trim();

    return request('/users/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Email verification with 6-digit OTP
  async verifyEmail({ email, otp }) {
    const res = await request('/users/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        email: email?.trim().toLowerCase(),
        otp: String(otp).trim(),
      }),
    });
    if (res.token) setAuthToken(res.token);
    return res;
  },

  // Resend OTP
  async resendOtp({ email }) {
    return request('/users/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email: email?.trim().toLowerCase() }),
    });
  },

  // Login: Citizen
  async loginUser({ email, password }) {
    const res = await request('/users/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email?.trim().toLowerCase(),
        password,
      }),
    });
    if (res.token) setAuthToken(res.token);
    return res;
  },

  // Login: Worker Group
  async loginWorker({ email, password }) {
    const res = await request('/workers/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email?.trim().toLowerCase(),
        password,
      }),
    });
    if (res.token) setAuthToken(res.token);
    return res;
  },

  // Login: Administrator
  async loginAdmin({ email, password }) {
    const res = await request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email?.trim().toLowerCase(),
        password,
      }),
    });
    if (res.token) setAuthToken(res.token);
    return res;
  },

  // Current session profile
  async getCurrentUser(role = 'END_USER') {
    if (role === 'ADMIN') return request('/admin/profile');
    if (role === 'WORKER_GROUP') return request('/workers/profile');
    return request('/users/me');
  },

  // Alias for getMe
  async getMe() {
    return request('/users/me');
  },

  // Update Citizen Profile
  async updateCurrentUser(data) {
    return request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Logout
  async logout(role = 'END_USER') {
    setAuthToken(null);
    localStorage.removeItem('roadsense_auth_user');
    localStorage.removeItem('roadsense_auth_role');
    try {
      if (role === 'ADMIN') {
        await request('/admin/logout', { method: 'POST' });
      } else if (role === 'WORKER_GROUP') {
        await request('/workers/logout', { method: 'POST' });
      } else {
        await request('/users/logout', { method: 'POST' });
      }
    } catch {
      // ignore network logout errors
    }
    return { message: 'Logout successful' };
  },
};
