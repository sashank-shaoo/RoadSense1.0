import { request, isDemoModeActive, setAuthToken } from './apiClient.js';
import {
  INITIAL_MOCK_USER,
  INITIAL_MOCK_WORKER,
  INITIAL_MOCK_ADMIN,
} from './mockData.js';

export const authApi = {
  // Citizen Registration
  async register(userData) {
    if (isDemoModeActive()) {
      await new Promise((r) => setTimeout(r, 600));
      return {
        message: 'Registration successful! Demo OTP: 123456',
        user: {
          id: 'usr-' + Date.now(),
          name: userData.name,
          email: userData.email,
          role: 'END_USER',
          credit_points: 0,
        },
        verification_sent: true,
        verification_required: true,
        demo_otp: '123456',
      };
    }

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
    if (isDemoModeActive()) {
      await new Promise((r) => setTimeout(r, 600));
      const demoUser = {
        ...INITIAL_MOCK_USER,
        email,
        is_varified_email: true,
      };
      setAuthToken('demo-token-citizen-12345');
      return {
        message: 'Email verified successfully!',
        user: demoUser,
        token: 'demo-token-citizen-12345',
      };
    }
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
    if (isDemoModeActive()) {
      await new Promise((r) => setTimeout(r, 400));
      return {
        message: 'Verification code resent successfully (Demo OTP: 123456)',
      };
    }
    return request('/users/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email: email?.trim().toLowerCase() }),
    });
  },

  // Login: Citizen
  async loginUser({ email, password }) {
    if (isDemoModeActive()) {
      await new Promise((r) => setTimeout(r, 500));
      setAuthToken('demo-token-citizen-12345');
      return {
        message: 'Login successful',
        user: { ...INITIAL_MOCK_USER, email },
        token: 'demo-token-citizen-12345',
      };
    }
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
    if (isDemoModeActive()) {
      await new Promise((r) => setTimeout(r, 500));
      setAuthToken('demo-token-worker-67890');
      return {
        message: 'Worker group login successful',
        worker_group: { ...INITIAL_MOCK_WORKER, email },
        token: 'demo-token-worker-67890',
      };
    }
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
    if (isDemoModeActive()) {
      await new Promise((r) => setTimeout(r, 500));
      setAuthToken('demo-token-admin-99999');
      return {
        message: 'Admin login successful',
        admin: { ...INITIAL_MOCK_ADMIN, email },
        token: 'demo-token-admin-99999',
      };
    }
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
    if (isDemoModeActive()) {
      if (role === 'ADMIN') return { admin: INITIAL_MOCK_ADMIN };
      if (role === 'WORKER_GROUP') return { worker_group: INITIAL_MOCK_WORKER };
      return { user: INITIAL_MOCK_USER };
    }

    if (role === 'ADMIN') return request('/admin/profile');
    if (role === 'WORKER_GROUP') return request('/workers/profile');
    return request('/users/me');
  },

  // Update Citizen Profile
  async updateCurrentUser(data) {
    if (isDemoModeActive()) {
      await new Promise((r) => setTimeout(r, 400));
      return {
        message: 'User updated successfully',
        user: { ...INITIAL_MOCK_USER, ...data },
      };
    }
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
    if (isDemoModeActive()) {
      return { message: 'Logout successful' };
    }
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
