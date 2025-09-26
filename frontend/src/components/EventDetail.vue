<template>
  <div class="event-detail">
    <el-descriptions title="事件基本信息" :column="2" border>
      <el-descriptions-item label="事件ID">{{ event.id }}</el-descriptions-item>
      <el-descriptions-item label="事件类型">
        <el-tag :type="getEventTypeTag(event.eventType)">
          {{ getEventTypeName(event.eventType) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="设备名称">{{ event.deviceName }}</el-descriptions-item>
      <el-descriptions-item label="严重程度">
        <el-tag :type="getSeverityType(event.severity)" size="small">
          {{ getSeverityName(event.severity) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="发生时间">{{ formatDateTime(event.occurredAt) }}</el-descriptions-item>
      <el-descriptions-item label="接收时间">{{ formatDateTime(event.receivedAt) }}</el-descriptions-item>
      <el-descriptions-item label="处理状态">
        <el-tag :type="getStatusType(event.processingStatus)" size="small">
          {{ getStatusName(event.processingStatus) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="位置信息" :span="2">
        <span v-if="event.lng && event.lat">
          经度: {{ event.lng }}, 纬度: {{ event.lat }}
        </span>
        <span v-else>无位置信息</span>
      </el-descriptions-item>
    </el-descriptions>

    <el-divider />

    <h3>事件详情</h3>
    <el-card>
      <pre class="event-payload">{{ JSON.stringify(event.payload, null, 2) }}</pre>
    </el-card>

    <el-divider />

    <h3>相关告警</h3>
    <el-table :data="relatedAlerts" v-if="relatedAlerts.length > 0">
      <el-table-column prop="id" label="告警ID" width="80" />
      <el-table-column prop="title" label="告警标题" />
      <el-table-column prop="severity" label="级别" width="80">
        <template #default="scope">
          <el-tag :type="getSeverityType(scope.row.severity)" size="small">
            {{ getSeverityName(scope.row.severity) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getAlertStatusType(scope.row.status)" size="small">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="160">
        <template #default="scope">
          {{ formatDateTime(scope.row.createdAt) }}
        </template>
      </el-table-column>
    </el-table>
    <p v-else>此事件未触发任何告警</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})

const relatedAlerts = ref([])

onMounted(() => {
  // 模拟加载相关告警
  if (props.event.id === 1003) {
    relatedAlerts.value = [
      {
        id: 2001,
        title: '北侧雷达检测到逆行车辆',
        severity: 'CRITICAL',
        status: 'OPEN',
        createdAt: new Date('2024-01-15T10:15:05')
      }
    ]
  }
})

// 复用事件管理页面中的工具函数
const getEventTypeName = (type) => {
  const typeMap = {
    'CONGESTION': '拥堵事件',
    'PEDESTRIAN_RED_LIGHT': '行人闯红灯',
    'CONTRAFLOW': '逆行事件',
    'CONSTRUCTION': '施工事件',
    'CUSTOM': '自定义事件'
  }
  return typeMap[type] || type
}

const getEventTypeTag = (type) => {
  const tagMap = {
    'CONGESTION': 'warning',
    'PEDESTRIAN_RED_LIGHT': 'danger',
    'CONTRAFLOW': 'error',
    'CONSTRUCTION': 'info',
    'CUSTOM': ''
  }
  return tagMap[type] || 'info'
}

const getSeverityName = (severity) => {
  const severityMap = {
    'LOW': '低',
    'MEDIUM': '中',
    'HIGH': '高',
    'CRITICAL': '紧急'
  }
  return severityMap[severity] || severity
}

const getSeverityType = (severity) => {
  const typeMap = {
    'LOW': 'info',
    'MEDIUM': 'warning',
    'HIGH': 'danger',
    'CRITICAL': 'error'
  }
  return typeMap[severity] || 'info'
}

const getStatusName = (status) => {
  const statusMap = {
    'NEW': '新建',
    'PROCESSED': '已处理',
    'DROPPED': '已丢弃',
    'ERROR': '错误'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    'NEW': 'info',
    'PROCESSED': 'success',
    'DROPPED': 'warning',
    'ERROR': 'danger'
  }
  return typeMap[status] || 'info'
}

const getAlertStatusType = (status) => {
  const typeMap = {
    'OPEN': 'warning',
    'ACKED': 'info',
    'RESOLVED': 'success',
    'IGNORED': 'danger'
  }
  return typeMap[status] || 'info'
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.event-detail {
  padding: 10px;
}

.event-payload {
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 14px;
  max-height: 300px;
  overflow: auto;
}
</style>