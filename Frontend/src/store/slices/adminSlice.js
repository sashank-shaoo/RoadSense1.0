import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  workerGroups: [],
  isLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setUsers(state, action) {
      state.users = action.payload;
    },
    setWorkerGroups(state, action) {
      state.workerGroups = action.payload;
    },
    addWorkerGroup(state, action) {
      state.workerGroups = [...state.workerGroups, action.payload];
    },
    setAdminError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setLoading, setUsers, setWorkerGroups, addWorkerGroup, setAdminError } =
  adminSlice.actions;

export default adminSlice.reducer;
