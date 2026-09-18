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
};
