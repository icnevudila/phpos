// ============================================
// API CLIENT - For Frontend to communicate with backend
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (!navigator.onLine) {
        throw new Error('Offline - request queued');
      }
      throw error;
    }
  }

  async syncPush(tenantId, entityType, operations) {
    return this.request(`/api/sync/push/${tenantId}`, {
      method: 'POST',
      body: JSON.stringify({ entityType, operations }),
    });
  }

  async syncPull(tenantId, since) {
    return this.request(`/api/sync/pull/${tenantId}?since=${encodeURIComponent(since)}`);
  }

  async login(username, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async getTransaction(tenantId, localId, deviceId) {
    return this.request(`/api/transactions/${tenantId}?localId=${localId}&deviceId=${deviceId}`);
  }
}

export default new ApiClient();

