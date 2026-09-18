import { request, isDemoModeActive } from './apiClient.js';
import { INITIAL_MOCK_REPORTS } from './mockData.js';

let localReports = [...INITIAL_MOCK_REPORTS];
let supportedSet = new Set();

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
    if (isDemoModeActive()) {
      await new Promise((r) => setTimeout(r, 500));
      return { success: true, reports: [...localReports] };
    }
    const res = await request('/reports/all');
    const rawList = res?.reports || (Array.isArray(res) ? res : []);
    return {
      success: true,
      reports: rawList.map(normalizeReport),
    };
  },

  async getReportsByUser(userId) {
    if (isDemoModeActive()) {
      await new Promise((r) => setTimeout(r, 400));
      const reports = localReports.filter((r) => r.user_id === userId);
      return { success: true, reports };
    }
    const res = await request(`/reports/user/${userId}`);
    const rawList = res?.reports || (Array.isArray(res) ? res : []);
    return {
      success: true,
      reports: rawList.map(normalizeReport),
    };
  },

  async getReportsByStatus(status) {
    if (isDemoModeActive()) {
      await new Promise((r) => setTimeout(r, 400));
      const reports = localReports.filter((r) => r.status === status);
      return { success: true, reports };
    }
    const res = await request(`/reports/status/${status}`);
    const rawList = res?.reports || (Array.isArray(res) ? res : []);
    return {
      success: true,
      reports: rawList.map(normalizeReport),
    };
  },

  async createReport(formData) {
    if (isDemoModeActive()) {
      await new Promise((r) => setTimeout(r, 1800)); // simulate AI processing
      const newReport = {
        id: `rep-${Date.now()}`,
        user_id: 'usr-101',
        reporter_name: 'Amit Sharma',
        original_filename: formData.get ? formData.get('file')?.name || 'report.jpg' : 'report.jpg',
        image_mime_type: 'image/jpeg',
        image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        description: formData.get ? formData.get('description') || null : null,
        location: {
          latitude: 20.2961 + (Math.random() - 0.5) * 0.05,
          longitude: 85.8245 + (Math.random() - 0.5) * 0.05,
        },
        status: 'notStarted',
        detection_count: 2,
        highest_severity: 'HIGH',
        damage_score: +(4.5 + Math.random() * 4).toFixed(2),
        support_count: 0,
        created_at: new Date().toISOString(),
        raw_ai_response: {
          count: 2,
          highest_severity: 'HIGH',
          damage_score: 6.5,
          model_version: 'YOLOv8-Road-v1.0 (best.pt)',
          detections: [
            { class: 'pothole', confidence: 0.912, bbox: [160, 200, 200, 140] },
            { class: 'alligator_crack', confidence: 0.847, bbox: [380, 260, 160, 100] },
          ],
        },
      };
      localReports = [newReport, ...localReports];
      return { success: true, report: newReport, message: 'Report created and processed successfully' };
    }
    const res = await request('/reports/create', { method: 'POST', body: formData });
    return {
      ...res,
      report: normalizeReport(res.report),
    };
  },

  async supportReport(reportId) {
    if (isDemoModeActive()) {
      await new Promise((r) => setTimeout(r, 400));
      if (supportedSet.has(reportId)) {
        return { success: true, already_supported: true, message: 'Report already supported' };
      }
      supportedSet.add(reportId);
      const idx = localReports.findIndex((r) => r.id === reportId);
      if (idx !== -1) {
        localReports[idx] = { ...localReports[idx], support_count: localReports[idx].support_count + 1 };
      }
      return { success: true, message: 'Report supported successfully', support_count: localReports[idx]?.support_count, credit_points: 250 };
    }
    const res = await request(`/reports/${reportId}/support`, { method: 'POST' });
    return {
      ...res,
      already_supported: Boolean(res.already_supported || res.alreadySupported),
      support_count: res.support_count ?? res.supportCount,
      credit_points: res.credit_points ?? res.creditPoints,
    };
  },
};
