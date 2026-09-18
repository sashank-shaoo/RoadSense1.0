import { request } from './apiClient.js';

const normalizeReport = (r) => {
  if (!r) return r;
  const lat = Number(r.location?.latitude ?? r.latitude);
  const lng = Number(r.location?.longitude ?? r.longitude);
  return {
    ...r,
    location: {
      latitude: !isNaN(lat) && lat !== 0 ? lat : 20.2961,
      longitude: !isNaN(lng) && lng !== 0 ? lng : 85.8245,
    },
    image_url: r.media_url || r.image_url,
    video_url: r.media_type === 'video' ? (r.media_url || r.video_url) : null,
  };
};

export const reportApi = {
  async getAllReports() {
    const res = await request('/reports/all');
    const rawList = res?.reports || (Array.isArray(res) ? res : []);
    return {
      success: true,
      reports: rawList.map(normalizeReport),
    };
  },

  async getReportsByUser(userId) {
    const res = await request(`/reports/user/${userId}`);
    const rawList = res?.reports || (Array.isArray(res) ? res : []);
    return {
      success: true,
      reports: rawList.map(normalizeReport),
    };
  },

  // Alias for getMyReports
  async getMyReports(userId) {
    return this.getReportsByUser(userId);
  },

  async getReportsByStatus(status) {
    const res = await request(`/reports/status/${status}`);
    const rawList = res?.reports || (Array.isArray(res) ? res : []);
    return {
      success: true,
      reports: rawList.map(normalizeReport),
    };
  },

  async createReport(formData) {
    const res = await request('/reports/create', { method: 'POST', body: formData });
    return {
      ...res,
      report: normalizeReport(res.report),
    };
  },

  async supportReport(reportId) {
    const res = await request(`/reports/${reportId}/support`, { method: 'POST' });
    return {
      ...res,
      already_supported: Boolean(res.already_supported || res.alreadySupported),
      support_count: res.support_count ?? res.supportCount,
      credit_points: res.credit_points ?? res.creditPoints,
    };
  },
};
