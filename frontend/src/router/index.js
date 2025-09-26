// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

// 导入所有视图组件
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import DeviceManagement from '@/views/DeviceManagement.vue'
import EventManagement from '@/views/EventManagement.vue'
import RuleManagement from '@/views/RuleManagement.vue'
import AlertManagement from '@/views/AlertManagement.vue'
import TicketManagement from '@/views/TicketManagement.vue'
import Analytics from '@/views/Analytics.vue'
import UserManagement from '@/views/UserManagement.vue'
import SystemSettings from '@/views/SystemSettings.vue'

const routes = [
  { path: '/login', component: Login, meta: { requiresAuth: false } },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/devices', component: DeviceManagement, meta: { requiresAuth: true, requiredRole: ['TENANT_ADMIN', 'OPS'] } },
  { path: '/events', component: EventManagement, meta: { requiresAuth: true, requiredRole: ['TENANT_ADMIN', 'OPS', 'ANALYST', 'VIEWER'] } },
  { path: '/rules', component: RuleManagement, meta: { requiresAuth: true, requiredRole: ['TENANT_ADMIN', 'OPS'] } },
  { path: '/alerts', component: AlertManagement, meta: { requiresAuth: true, requiredRole: ['TENANT_ADMIN', 'OPS', 'DISPATCHER', 'VIEWER'] } },
  { path: '/tickets', component: TicketManagement, meta: { requiresAuth: true, requiredRole: ['TENANT_ADMIN', 'OPS', 'DISPATCHER'] } },
  { path: '/analytics', component: Analytics, meta: { requiresAuth: true, requiredRole: ['TENANT_ADMIN', 'ANALYST', 'VIEWER'] } },
  { path: '/users', component: UserManagement, meta: { requiresAuth: true, requiredRole: ['TENANT_ADMIN'] } },
  { path: '/settings', component: SystemSettings, meta: { requiresAuth: true, requiredRole: ['TENANT_ADMIN'] } },
  { path: '/', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 页面名称映射
const pageNames = {
  '/dashboard': '系统总览',
  '/devices': '设备管理',
  '/events': '事件管理',
  '/rules': '规则管理',
  '/alerts': '告警管理',
  '/tickets': '工单管理',
  '/analytics': '智能分析',
  '/users': '用户管理',
  '/settings': '系统设置'
}

// 角色名称映射
const roleNames = {
  'TENANT_ADMIN': '租户管理员',
  'OPS': '运维人员',
  'ANALYST': '分析员',
  'DISPATCHER': '调度员',
  'VIEWER': '观察员'
}

// 增强的路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 检查是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!userStore.isLoggedIn()) {
      ElMessage.warning('请先登录系统')
      next('/login')
      return
    }

    // 检查角色权限
    if (to.meta.requiredRole && !to.meta.requiredRole.includes(userStore.user.role)) {
      const pageName = pageNames[to.path] || to.path
      const requiredRoles = to.meta.requiredRole.map(role => roleNames[role] || role).join('、')
      const currentRole = roleNames[userStore.user.role] || userStore.user.role
      
      ElMessage.error({
        message: `权限不足！您无法访问${pageName}页面。<br/>所需角色: ${requiredRoles}<br/>当前角色: ${currentRole}`,
        dangerouslyUseHTMLString: true,
        duration: 5000
      })
      
      console.warn(`权限不足: 用户角色 ${userStore.user.role} 无法访问 ${to.path}，需要角色: ${to.meta.requiredRole.join(', ')}`)
      next('/dashboard')
      return
    }
  }

  next()
})

export default router