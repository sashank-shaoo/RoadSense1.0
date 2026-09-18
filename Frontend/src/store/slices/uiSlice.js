import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toasts: [],
  activeModal: null, // 'login' | 'register' | 'otp' | 'createReport' | 'reportDetail'
  isNavOpen: false,
};

let toastId = 0;

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal(state, action) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
    addToast(state, action) {
      const { type = 'info', message, duration = 4000 } = action.payload;
      state.toasts.push({ id: ++toastId, type, message, duration });
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    toggleNav(state) {
      state.isNavOpen = !state.isNavOpen;
    },
    closeNav(state) {
      state.isNavOpen = false;
    },
  },
});

export const {
  openModal,
  closeModal,
  addToast,
  removeToast,
  toggleNav,
  closeNav,
} = uiSlice.actions;

export default uiSlice.reducer;
