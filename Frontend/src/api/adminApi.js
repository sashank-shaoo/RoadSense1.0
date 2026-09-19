import { request } from './apiClient.js';

export const adminApi = {
  async getAllUsers() {
    return request('/admin/users');
  },

  async getUsers() {
    return request('/admin/users');
  },

  async getAllWorkerGroups() {
    return request('/admin/worker-groups');
  },

  async getWorkerGroups() {
    return request('/admin/worker-groups');
  },

  async createWorkerGroup(data) {
    return request('/admin/create-worker-group', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ── Individual Worker (WORKER role, not WORKER_GROUP) ──
  async getWorkers() {
    return request('/admin/workers');
  },

  async createWorker(data) {
    return request('/admin/workers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async toggleWorkerActive(workerId, is_active) {
    return request(`/admin/workers/${workerId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active }),
    });
  },

  // ── Issues ──
  async getIssues(status) {
    const query = status ? `?status=${status}` : '';
    return request(`/admin/issues${query}`);
  },

  async resolveIssue(issueId, status) {
    return request(`/admin/issues/${issueId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
