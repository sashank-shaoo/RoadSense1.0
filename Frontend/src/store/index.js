import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import reportReducer from './slices/reportSlice.js';
import uiReducer from './slices/uiSlice.js';
import adminReducer from './slices/adminSlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    reports: reportReducer,
    ui: uiReducer,
    admin: adminReducer,
  },
});

export { store };
export default store;
