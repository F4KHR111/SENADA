import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import adminService from '../services/adminService'

export const ADMIN_KEYS = {
  stats: ['admin', 'stats'],
  users: (params) => ['admin', 'users', params],
  roles: ['admin', 'roles'],
  vendors: (params) => ['admin', 'vendors', params],
  auditLogs: (params) => ['admin', 'audit-logs', params],
}

// 1. Dashboard Stats
export function useAdminStats() {
  return useQuery({
    queryKey: ADMIN_KEYS.stats,
    queryFn: adminService.getDashboardStats,
  })
}

// 2. Users
export function useAdminUsers(params) {
  return useQuery({
    queryKey: ADMIN_KEYS.users(params),
    queryFn: () => adminService.getUsers(params),
  })
}

export function useAdminRoles() {
  return useQuery({
    queryKey: ADMIN_KEYS.roles,
    queryFn: adminService.getRoles,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => adminService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.stats })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => adminService.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.stats })
    },
  })
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => adminService.toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.stats })
    },
  })
}

// 3. Vendors
export function useAdminVendors(params) {
  return useQuery({
    queryKey: ADMIN_KEYS.vendors(params),
    queryFn: () => adminService.getVendors(params),
  })
}

export function useVerifyVendor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }) => adminService.verifyVendor(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] })
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.stats })
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] })
    },
  })
}

// 4. Audit Logs
export function useAdminAuditLogs(params) {
  return useQuery({
    queryKey: ADMIN_KEYS.auditLogs(params),
    queryFn: () => adminService.getAuditLogs(params),
  })
}
