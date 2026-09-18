import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reports: [],
  myReports: [],
  activeReport: null,
  filter: 'all', // 'all' | 'notStarted' | 'onGoing' | 'completed'
  severityFilter: 'all', // 'all' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setSubmitting(state, action) {
      state.isSubmitting = action.payload;
    },
    setReports(state, action) {
      state.reports = action.payload;
    },
    setMyReports(state, action) {
      state.myReports = action.payload;
    },
    addReport(state, action) {
      state.reports = [action.payload, ...state.reports];
      state.myReports = [action.payload, ...state.myReports];
    },
    setActiveReport(state, action) {
      state.activeReport = action.payload;
    },
    clearActiveReport(state) {
      state.activeReport = null;
    },
    setFilter(state, action) {
      state.filter = action.payload;
    },
    setSeverityFilter(state, action) {
      state.severityFilter = action.payload;
    },
    updateReportSupportCount(state, action) {
      const { reportId, supportCount } = action.payload;
      state.reports = state.reports.map((r) =>
        r.id === reportId ? { ...r, support_count: supportCount } : r
      );
      state.myReports = state.myReports.map((r) =>
        r.id === reportId ? { ...r, support_count: supportCount } : r
      );
      if (state.activeReport?.id === reportId) {
        state.activeReport = { ...state.activeReport, support_count: supportCount };
      }
    },
    setReportError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
      state.isSubmitting = false;
    },
    clearReportError(state) {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setSubmitting,
  setReports,
  setMyReports,
  addReport,
  setActiveReport,
  clearActiveReport,
  setFilter,
  setSeverityFilter,
  updateReportSupportCount,
  setReportError,
  clearReportError,
} = reportSlice.actions;

export default reportSlice.reducer;
