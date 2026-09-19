import { request } from './apiClient.js';

export const workerApi = {
  // Fetch worker group profile (with leader_name and members)
  async getProfile() {
    return request('/workers/profile');
  },

  // Fetch registered workers eligible to be added to group
  async getAvailableWorkers() {
    return request('/workers/available-workers');
  },

  // Create a new individual worker member account (Worker Group permission)
  async createWorker(data) {
    return request('/workers/create-worker', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Add a worker member to the worker group
  async addMember(workerId) {
    return request('/workers/members', {
      method: 'POST',
      body: JSON.stringify({ worker_id: workerId }),
    });
  },

  // Remove a worker member from the group
  async removeMember(workerId) {
    return request(`/workers/members/${workerId}`, {
      method: 'DELETE',
    });
  },
};

