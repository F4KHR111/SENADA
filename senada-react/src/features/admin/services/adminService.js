import apiClient from '../../../services/apiClient'

const adminService = {
  // 1. Dashboard
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/dashboard-stats')
    return response.data
  },

  // 2. Users
  getUsers: async (params = {}) => {
    const response = await apiClient.get('/admin/users', { params })
    return response.data
  },

  getRoles: async () => {
    const response = await apiClient.get('/admin/roles')
    return response.data
  },

  createUser: async (payload) => {
    const response = await apiClient.post('/admin/users', payload)
    return response.data
  },

  updateUser: async (id, payload) => {
    const response = await apiClient.put(`/admin/users/${id}`, payload)
    return response.data
  },

  toggleUserStatus: async (id) => {
    const response = await apiClient.patch(`/admin/users/${id}/status`)
    return response.data
  },

  // 3. Vendors
  getVendors: async (params = {}) => {
    const response = await apiClient.get('/admin/vendors', { params })
    return response.data
  },

  verifyVendor: async (id, action) => {
    const response = await apiClient.patch(`/admin/vendors/${id}/verify`, { action })
    return response.data
  },

  // 4. Audit Logs
  getAuditLogs: async (params = {}) => {
    const response = await apiClient.get('/admin/audit-logs', { params })
    return response.data
  },
}

export default adminService
