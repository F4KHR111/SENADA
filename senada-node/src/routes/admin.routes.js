'use strict'

const express = require('express')
const router = express.Router()
const AdminController = require('../controllers/admin.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const { requireRole } = require('../middlewares/rbac.middleware')

// Seluruh endpoint admin diwajibkan login dan memiliki role 'admin'
router.use(authMiddleware, requireRole('admin'))

// 1. Dashboard Stats
router.get('/dashboard-stats', AdminController.getDashboardStats)

// 2. User Management
router.get('/users', AdminController.getUsers)
router.post('/users', AdminController.createUser)
router.put('/users/:id', AdminController.updateUser)
router.patch('/users/:id/status', AdminController.toggleUserStatus)
router.get('/roles', AdminController.getRoles)

// 3. Vendor Verification
router.get('/vendors', AdminController.getVendors)
router.patch('/vendors/:id/verify', AdminController.verifyVendor)

// 4. Audit Log
router.get('/audit-logs', AdminController.getAuditLogs)

module.exports = router
