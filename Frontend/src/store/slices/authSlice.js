import { createSlice } from '@reduxjs/toolkit';
import { getAuthToken } from '../../api/apiClient.js';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('roadsense_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const storedToken = getAuthToken();
const storedUser = getStoredUser();
const storedRole = localStorage.getItem('roadsense_auth_role') || (storedUser?.role ?? null);

const initialState = {
  user: storedUser,
  token: storedToken,
  role: storedRole, // 'END_USER' | 'WORKER_GROUP' | 'ADMIN'
  isAuthenticated: Boolean(storedToken && storedUser),
  isLoading: false,
  error: null,
  pendingVerification: null, // { email } waiting for OTP
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    loginSuccess(state, action) {
      const { user, token, role } = action.payload;
      const effectiveRole = role || user?.role || 'END_USER';
      state.user = user;
      state.token = token;
      state.role = effectiveRole;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.pendingVerification = null;

      if (token) localStorage.setItem('roadsense_auth_token', token);
      if (user) localStorage.setItem('roadsense_auth_user', JSON.stringify(user));
      if (effectiveRole) localStorage.setItem('roadsense_auth_role', effectiveRole);
    },
    logoutSuccess(state) {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      state.pendingVerification = null;

      localStorage.removeItem('roadsense_auth_token');
      localStorage.removeItem('roadsense_auth_user');
      localStorage.removeItem('roadsense_auth_role');
    },
    setPendingVerification(state, action) {
      state.pendingVerification = action.payload;
    },
    updateUserProfile(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('roadsense_auth_user', JSON.stringify(state.user));
      }
    },
    addCreditPoints(state, action) {
      if (state.user && state.user.credit_points !== undefined) {
        state.user.credit_points = (state.user.credit_points || 0) + action.payload;
        localStorage.setItem('roadsense_auth_user', JSON.stringify(state.user));
      }
    },
    updateCreditPoints(state, action) {
      if (state.user) {
        state.user.credit_points = action.payload;
        localStorage.setItem('roadsense_auth_user', JSON.stringify(state.user));
      }
    },
    setAuthError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  loginSuccess,
  logoutSuccess,
  setPendingVerification,
  updateUserProfile,
  addCreditPoints,
  updateCreditPoints,
  setAuthError,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
