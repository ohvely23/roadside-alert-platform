<template>
  <div class="system-settings">
    <h2>系统设置</h2>

    <el-tabs v-model="activeTab" type="border-card">
      <!-- 基本设置 -->
      <el-tab-pane label="基本设置" name="general">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统参数配置</span>
            </div>
          </template>

          <el-form :model="systemSettings" label-width="200px">
            <el-form-item label="系统名称">
              <el-input v-model="systemSettings.systemName" placeholder="请输入系统名称" />
            </el-form-item>
            
            <el-form-item label="事件保留天数">
              <el-input-number v-model="systemSettings.eventRetentionDays" :min="30" :max="365" />
              <span class="tip-text">事件数据在数据库中的保留天数</span>
            </el-form-item>
            
            <el-form-item label="告警保留天数">
              <el-input-number v-model="systemSettings.alertRetentionDays" :min="30" :max="365" />
              <span class="tip-text">告警数据在数据库中的保留天数</span>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveSystemSettings">保存设置</el-button>
              <el-button @click="resetSystemSettings">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 通知设置 -->
      <el-tab-pane label="通知设置" name="notifications">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>通知渠道配置</span>
            </div>
          </template>

          <el-table :data="notificationChannels" style="width: 100%">
            <el-table-column prop="name" label="渠道名称" width="120" />
            <el-table-column prop="type" label="渠道类型" width="100">
              <template #default="scope">
                <el-tag>{{ getChannelTypeName(scope.row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="config" label="配置详情" min-width="200">
              <template #default="scope">
                <div class="channel-config">
                  {{ formatChannelConfig(scope.row) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="enabled" label="状态" width="80">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.enabled"
                  @change="toggleChannelStatus(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button size="small" @click="editChannel(scope.row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('general')

// 系统设置
const systemSettings = ref({
  systemName: '路侧告警平台',
  eventRetentionDays: 90,
  alertRetentionDays: 180
})

// 通知渠道
const notificationChannels = ref([
  {
    id: 1,
    name: '邮件通知',
    type: 'EMAIL',
    config: { host: 'smtp.example.com', port: 587 },
    enabled: true
  },
  {
    id: 2,
    name: '企业微信',
    type: 'WEBHOOK',
    config: { url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send' },
    enabled: true
  }
])

onMounted(() => {
  // 可以在这里加载系统设置
})

const saveSystemSettings = () => {
  // 模拟API调用
  ElMessage.success('系统设置已保存')
}

const resetSystemSettings = () => {
  // 重置为默认值
  systemSettings.value = {
    systemName: '路侧告警平台',
    eventRetentionDays: 90,
    alertRetentionDays: 180
  }
  ElMessage.info('设置已重置为默认值')
}

const toggleChannelStatus = async (channel) => {
  // 模拟API调用
  ElMessage.success(`渠道已${channel.enabled ? '启用' : '禁用'}`)
}

const editChannel = (channel) => {
  ElMessage.info(`编辑渠道: ${channel.name}`)
}

const getChannelTypeName = (type) => {
  const typeMap = {
    'EMAIL': '邮件',
    'WEBHOOK': 'Webhook',
    'SMS': '短信'
  }
  return typeMap[type] || type
}

const formatChannelConfig = (channel) => {
  switch (channel.type) {
    case 'EMAIL':
      return `SMTP: ${channel.config.host}:${channel.config.port}`
    case 'WEBHOOK':
      return `URL: ${channel.config.url}`
    default:
      return JSON.stringify(channel.config)
  }
}
</script>

<style scoped>
.system-settings {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tip-text {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.channel-config {
  font-family: monospace;
  font-size: 12px;
}
</style>