import { request, isDemoModeActive } from './apiClient.js';
import { INITIAL_MOCK_USERS_LIST, INITIAL_MOCK_WORKER_GROUPS } from './mockData.js';

let localUsers = [...INITIAL_MOCK_USERS_LIST];
let localWorkerGroups = [...INITIAL_MOCK_WORKER_GROUPS];

export const adminApi = {
  async getAllUsers() {
    if (isDemoModeActive()) {
      await new Promise((r) => setTimeout(r, 400));
      return { success: true, users: localUsers };
    }
    return request('/admin/users');
  },

  async getAllWorkerGroups() {
    if (isDemoModeActive()) {
      await new Promise((r) => setTimeout(r, 400));
      return { success: true, worker_groups: localWorkerGroups };
    }
    return request('/admin/worker-groups');
  },

  async createWorkerGroup(data) {
    if (isDemoModeActive()) {
      await new Promise((r) => setTimeout(r, 600));
      const newGroup = {
        id: `wkg-${Date.now()}`,
        name: data.name,
        email: data.email,
        role: 'WORKER_GROUP',
      };
      localWorkerGroups = [...localWorkerGroups, newGroup];
      return { success: true, worker_group: newGroup, message: 'Worker group created successfully' };
    }
    return request('/admin/create-worker-group', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
