<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="showUserDialog('create')">
        <el-icon><Plus /></el-icon>
        新建用户
      </el-button>
    </div>

    <el-card>
      <div class="filter-bar">
        <el-input
          v-model="filter.keyword"
          placeholder="搜索用户名或邮箱"
          style="width: 300px; margin-right: 15px;"
          clearable
          @keyup.enter="loadUsers"
        >
          <template #append>
            <el-button @click="loadUsers">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>

        <el-select v-model="filter.status" placeholder="状态筛选" @change="loadUsers" clearable>
          <el-option label="启用" value="ACTIVE" />
          <el-option label="禁用" value="INACTIVE" />
        </el-select>

        <el-select v-model="filter.role" placeholder="角色筛选" @change="loadUsers" clearable>
          <el-option
            v-for="role in roleOptions"
            :key="role.code"
            :label="role.name"
            :value="role.code"
          />
        </el-select>
      </div>

      <el-table :data="users" v-loading="loading" style="width: 100%">
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="roles" label="角色" width="150">
          <template #default="scope">
            <el-tag
              v-for="role in scope.row.roles"
              :key="role"
              size="small"
              style="margin-right: 5px;"
              :type="getRoleTagType(role)"
            >
              {{ getRoleName(role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 'ACTIVE' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.lastLoginAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="showUserDialog('edit', scope.row)">
              编辑
            </el-button>
            <el-button 
              size="small" 
              :type="scope.row.status === 'ACTIVE' ? 'danger' : 'success'"
              @click="toggleUserStatus(scope.row)"
            >
              {{ scope.row.status === 'ACTIVE' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          @current-change="loadUsers"
          @size-change="handleSizeChange"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
        />
      </div>
    </el-card>

    <!-- 用户编辑对话框 -->
    <el-dialog 
      v-model="userDialogVisible" 
      :title="dialogMode === 'create' ? '新建用户' : '编辑用户'" 
      width="500px"
    >
      <el-form :model="currentUser" label-width="80px">
        <el-form-item label="用户名" required>
          <el-input v-model="currentUser.username" />
        </el-form-item>
        <el-form-item label="邮箱" required>
          <el-input v-model="currentUser.email" type="email" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="currentUser.phone" />
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="currentUser.roles" multiple placeholder="请选择角色">
            <el-option
              v-for="role in roleOptions"
              :key="role.code"
              :label="role.name"
              :value="role.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="currentUser.status" active-value="ACTIVE" inactive-value="INACTIVE" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const userDialogVisible = ref(false)
const dialogMode = ref('create')
const users = ref([])
const currentUser = ref({
  username: '',
  email: '',
  phone: '',
  roles: [],
  status: 'ACTIVE'
})

// 角色选项
const roleOptions = ref([
  { code: 'TENANT_ADMIN', name: '租户管理员' },
  { code: 'OPS', name: '运维工程师' },
  { code: 'DISPATCHER', name: '调度员' },
  { code: 'ANALYST', name: '数据分析员' },
  { code: 'VIEWER', name: '观察者' }
])

const filter = ref({
  keyword: '',
  status: '',
  role: ''
})

const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

onMounted(() => {
  loadUsers()
})

const loadUsers = async () => {
  loading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      users.value = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          phone: '13800138000',
          roles: ['TENANT_ADMIN'],
          status: 'ACTIVE',
          lastLoginAt: new Date('2024-01-15T10:30:00'),
          createdAt: new Date('2024-01-01T00:00:00')
        },
        {
          id: 2,
          username: 'ops_user',
          email: 'ops@example.com',
          phone: '13800138001',
          roles: ['OPS'],
          status: 'ACTIVE',
          lastLoginAt: new Date('2024-01-15T09:15:00'),
          createdAt: new Date('2024-01-05T10:30:00')
        }
      ]
      pagination.value.total = users.value.length
      loading.value = false
    }, 500)
  } catch (error) {
    ElMessage.error('加载用户列表失败')
    loading.value = false
  }
}

const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.current = 1
  loadUsers()
}

const showUserDialog = (mode, user = null) => {
  dialogMode.value = mode
  currentUser.value = user ? { ...user } : {
    username: '',
    email: '',
    phone: '',
    roles: [],
    status: 'ACTIVE'
  }
  userDialogVisible.value = true
}

const saveUser = async () => {
  // 模拟保存用户
  userDialogVisible.value = false
  ElMessage.success(dialogMode.value === 'create' ? '用户创建成功' : '用户更新成功')
  loadUsers()
}

const toggleUserStatus = async (user) => {
  try {
    const action = user.status === 'ACTIVE' ? '禁用' : '启用'
    await ElMessageBox.confirm(
      `确定要${action}用户 "${user.username}" 吗?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟API调用
    user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    ElMessage.success(`用户已${action}`)
  } catch (error) {
    ElMessage.info('取消操作')
  }
}

const getRoleName = (roleCode) => {
  const role = roleOptions.value.find(r => r.code === roleCode)
  return role ? role.name : roleCode
}

const getRoleTagType = (roleCode) => {
  const typeMap = {
    'TENANT_ADMIN': 'danger',
    'OPS': 'warning',
    'DISPATCHER': 'primary',
    'ANALYST': 'success',
    'VIEWER': 'info'
  }
  return typeMap[roleCode] || 'info'
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>