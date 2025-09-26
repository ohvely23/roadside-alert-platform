<template>
  <div class="login-container">
    <el-card class="login-box">
      <h2>路侧告警平台</h2>
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="loginFormRef"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleLogin"
            :loading="loading"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 演示账户区域 -->
      <div class="demo-accounts">
        <el-divider>演示账户（点击快速登录）</el-divider>
        <div class="account-buttons">
          <el-button 
            v-for="account in demoAccounts" 
            :key="account.role"
            type="primary" 
            link 
            @click="fillDemoAccount(account)"
            class="account-btn"
          >
            {{ account.name }} ({{ account.roleText }})
          </el-button>
        </div>
        <div class="account-tips">
          <el-alert
            title="不同角色拥有不同的页面访问权限"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <div class="tip-content">
                <p>• <strong>租户管理员</strong>: 可访问所有页面</p>
                <p>• <strong>运维人员</strong>: 可访问设备、事件、规则、告警、工单管理</p>
                <p>• <strong>分析员</strong>: 可访问分析、事件、告警页面</p>
                <p>• <strong>观察员</strong>: 只能访问总览和分析页面</p>
              </div>
            </template>
          </el-alert>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度至少3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
  ]
})

// 演示账户配置
const demoAccounts = [
  { 
    username: 'admin', 
    password: '123456', 
    role: 'TENANT_ADMIN', 
    name: '管理员', 
    roleText: '租户管理员',
    permissions: '所有页面权限'
  },
  { 
    username: 'analyst', 
    password: '123456', 
    role: 'ANALYST', 
    name: '分析员', 
    roleText: '分析员',
    permissions: '分析、事件、告警页面'
  },
  { 
    username: 'viewer', 
    password: '123456', 
    role: 'VIEWER', 
    name: '观察员', 
    roleText: '观察员',
    permissions: '总览和分析页面'
  },
  { 
    username: 'ops', 
    password: '123456', 
    role: 'OPS', 
    name: '运维人员', 
    roleText: '运维人员',
    permissions: '设备、事件、规则、告警、工单管理'
  },
  { 
    username: 'dispatcher', 
    password: '123456', 
    role: 'DISPATCHER', 
    name: '调度员', 
    roleText: '调度员',
    permissions: '告警和工单管理'
  }
]

// 填充演示账户信息
const fillDemoAccount = (account) => {
  form.username = account.username
  form.password = account.password
  
  ElMessage.info(`已填充 ${account.name} 账户信息`)
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    // 验证表单
    await loginFormRef.value.validate()
    loading.value = true

    // 模拟登录API调用
    setTimeout(() => {
      // 查找匹配的演示账户
      const matchedAccount = demoAccounts.find(
        account => account.username === form.username && account.password === form.password
      )

      if (matchedAccount) {
        // 登录成功
        userStore.login({
          id: Date.now(),
          username: form.username,
          role: matchedAccount.role,
          name: matchedAccount.name,
          email: `${form.username}@roadside-alert.com`
        }, `mock-token-${Date.now()}-${matchedAccount.role}`)

        ElMessage.success({
          message: `登录成功！欢迎 ${matchedAccount.name}`,
          duration: 2000
        })

        // 跳转到仪表板
        router.push('/dashboard')
      } else {
        // 登录失败
        ElMessage.error('用户名或密码错误，请使用演示账户登录')
      }
      
      loading.value = false
    }, 1000)
  } catch (error) {
    loading.value = false
    console.log('表单验证失败', error)
  }
}

// 页面加载时自动填充一个演示账户（方便测试）
import { onMounted } from 'vue'
onMounted(() => {
  // 默认填充管理员账户，方便测试
  fillDemoAccount(demoAccounts[0])
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 450px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
  font-weight: 600;
}

.demo-accounts {
  margin-top: 20px;
}

.account-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.account-btn {
  justify-content: flex-start;
  padding: 8px 0;
  font-size: 14px;
}

.tip-content {
  font-size: 12px;
  line-height: 1.4;
}

.tip-content p {
  margin: 2px 0;
}

:deep(.el-alert__description) {
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-box {
    width: 90%;
    margin: 0 auto;
  }
  
  .account-buttons {
    gap: 5px;
  }
}
</style>