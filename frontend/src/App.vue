<template>
  <el-container class="layout">
    <el-header height="56px" class="header">
      <div class="brand" @click="$router.push('/dashboard')">
        路侧告警平台
      </div>
      <el-menu
        class="nav"
        mode="horizontal"
        :default-active="activePath"
        :router="true"
      >
        <!-- 动态生成导航菜单 -->
        <el-menu-item 
          v-for="item in menuItems" 
          :key="item.path"
          :index="item.path"
          :disabled="!hasPermission(item.requiredRole)"
        >
          {{ item.title }}
          <el-tooltip 
            v-if="!hasPermission(item.requiredRole)" 
            :content="item.permissionTip"
            placement="top"
          >
            <el-icon style="margin-left: 5px;"><InfoFilled /></el-icon>
          </el-tooltip>
        </el-menu-item>
      </el-menu>
      <div class="spacer" />
      <div class="user-info">
        <span v-if="userStore.user">当前角色: {{ userStore.getRoleName() }}</span>
        <el-button type="primary" link @click="logout">退出登录</el-button>
      </div>
    </el-header>

    <el-main class="main">
      <router-view :key="$route.fullPath" />
    </el-main>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activePath = computed(() => route.path)

// 定义完整的导航菜单项
const menuItems = computed(() => [
  { 
    path: '/dashboard', 
    title: '总览', 
    requiredRole: [], // 所有角色都可访问
    permissionTip: ''
  },
  { 
    path: '/devices', 
    title: '设备管理', 
    requiredRole: ['TENANT_ADMIN', 'OPS'],
    permissionTip: '需要运维人员或管理员权限'
  },
  { 
    path: '/events', 
    title: '事件管理', 
    requiredRole: ['TENANT_ADMIN', 'OPS', 'ANALYST', 'VIEWER'],
    permissionTip: '需要观察员或以上权限'
  },
  { 
    path: '/rules', 
    title: '规则管理', 
    requiredRole: ['TENANT_ADMIN', 'OPS'],
    permissionTip: '需要运维人员或管理员权限'
  },
  { 
    path: '/alerts', 
    title: '告警管理', 
    requiredRole: ['TENANT_ADMIN', 'OPS', 'DISPATCHER', 'VIEWER'],
    permissionTip: '需要观察员或以上权限'
  },
  { 
    path: '/tickets', 
    title: '工单管理', 
    requiredRole: ['TENANT_ADMIN', 'OPS', 'DISPATCHER'],
    permissionTip: '需要调度员或以上权限'
  },
  { 
    path: '/analytics', 
    title: '智能分析', 
    requiredRole: ['TENANT_ADMIN', 'ANALYST', 'VIEWER'],
    permissionTip: '需要分析员或以上权限'
  },
  { 
    path: '/users', 
    title: '用户管理', 
    requiredRole: ['TENANT_ADMIN'],
    permissionTip: '需要管理员权限'
  },
  { 
    path: '/settings', 
    title: '系统设置', 
    requiredRole: ['TENANT_ADMIN'],
    permissionTip: '需要管理员权限'
  }
])

// 检查权限
const hasPermission = (requiredRoles) => {
  if (requiredRoles.length === 0) return true // 所有角色都可访问
  return userStore.hasPermission(requiredRoles)
}

const logout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
    // 用户取消退出
    console.log('取消退出登录')
  }
}
</script>

<style scoped>
.layout {
  height: 100vh;
}
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid var(--el-border-color);
}
.brand {
  font-weight: 600;
  cursor: pointer;
  margin-right: 8px;
  user-select: none;
  font-size: 18px;
  color: #409EFF;
}
.nav {
  border-bottom: none;
  flex: 0 1 auto;
}
.spacer {
  flex: 1 1 auto;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #606266;
}
.main {
  padding: 16px;
  background: var(--el-color-info-light-9);
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .nav {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav :deep(.el-menu-item) {
    padding: 0 12px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    height: auto;
    padding: 10px;
    gap: 10px;
  }
  
  .brand {
    margin-right: 0;
    margin-bottom: 5px;
  }
  
  .nav {
    order: 2;
    width: 100%;
    justify-content: center;
  }
  
  .spacer {
    display: none;
  }
  
  .user-info {
    order: 1;
    margin-bottom: 10px;
  }
  
  .nav :deep(.el-menu-item) {
    padding: 0 8px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .nav {
    flex-direction: column;
    align-items: center;
  }
  
  .nav :deep(.el-menu--horizontal) {
    display: flex;
    flex-direction: column;
  }
  
  .nav :deep(.el-menu-item) {
    width: 100%;
    text-align: center;
    margin-bottom: 5px;
  }
}
</style>