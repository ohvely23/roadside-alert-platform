// frontend/src/stores/user.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定义可用的角色类型
export const UserRoles = {
  TENANT_ADMIN: 'TENANT_ADMIN',
  OPS: 'OPS',
  ANALYST: 'ANALYST',
  DISPATCHER: 'DISPATCHER',
  VIEWER: 'VIEWER'
}

// 默认用户结构
const defaultUser = {
  id: null,
  username: '',
  role: UserRoles.VIEWER,
  email: '',
  name: '',
  loginTime: null
}

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUser = (userData) => {
    // 确保用户数据有默认结构，并添加登录时间
    user.value = { 
      ...defaultUser, 
      ...userData,
      loginTime: new Date().toISOString()
    }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  const login = (userData, userToken) => {
    setToken(userToken)
    setUser(userData)
    console.log('用户登录成功:', userData.username, '角色:', userData.role)
  }

  const logout = () => {
    console.log('用户退出登录:', user.value?.username)
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isLoggedIn = () => {
    return !!token.value && !!user.value
  }

  // 检查用户是否有特定权限
  const hasPermission = (requiredRoles) => {
    if (!user.value || !user.value.role) return false
    return requiredRoles.includes(user.value.role)
  }

  // 获取用户角色名称
  const getRoleName = () => {
    const roleNames = {
      'TENANT_ADMIN': '租户管理员',
      'OPS': '运维人员',
      'ANALYST': '分析员',
      'DISPATCHER': '调度员',
      'VIEWER': '观察员'
    }
    return roleNames[user.value?.role] || user.value?.role || '未知角色'
  }

  // 获取用户登录信息摘要
  const getUserInfo = () => {
    if (!user.value) return null
    return {
      name: user.value.name,
      role: getRoleName(),
      loginTime: user.value.loginTime ? new Date(user.value.loginTime).toLocaleString() : '未知'
    }
  }

  return { 
    token, 
    user, 
    setToken, 
    setUser, 
    login,
    logout, 
    isLoggedIn,
    hasPermission,
    getRoleName,
    getUserInfo
  }
})