<template>
  <div class="event-management">
    <div class="page-header">
      <h2>事件管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleExport">
          <el-icon><download /></el-icon>
          导出数据
        </el-button>
        <el-button @click="showFilter = !showFilter">
          <el-icon><filter /></el-icon>
          高级筛选
        </el-button>
      </div>
    </div>

    <el-card>
      <!-- 搜索和筛选区域 -->
      <div class="filter-section" v-if="showFilter">
        <el-row :gutter="15">
          <el-col :span="6">
            <el-input
              v-model="filter.keyword"
              placeholder="搜索事件内容"
              clearable
            />
          </el-col>
          <el-col :span="6">
            <el-select v-model="filter.eventType" placeholder="事件类型" clearable>
              <el-option label="拥堵事件" value="CONGESTION" />
              <el-option label="行人闯红灯" value="PEDESTRIAN_RED_LIGHT" />
              <el-option label="逆行事件" value="CONTRAFLOW" />
              <el-option label="施工事件" value="CONSTRUCTION" />
              <el-option label="自定义事件" value="CUSTOM" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filter.deviceId" placeholder="设备筛选" clearable>
              <el-option
                v-for="device in deviceOptions"
                :key="device.id"
                :label="device.name"
                :value="device.id"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filter.severity" placeholder="严重程度" clearable>
              <el-option label="低" value="LOW" />
              <el-option label="中" value="MEDIUM" />
              <el-option label="高" value="HIGH" />
              <el-option label="紧急" value="CRITICAL" />
            </el-select>
          </el-col>
        </el-row>
        
        <el-row :gutter="15" style="margin-top: 15px;">
          <el-col :span="12">
            <el-date-picker
              v-model="filter.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 100%"
            />
          </el-col>
          <el-col :span="12">
            <div style="display: flex; gap: 10px;">
              <el-button type="primary" @click="loadEvents">搜索</el-button>
              <el-button @click="resetFilter">重置</el-button>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 事件列表 -->
      <el-table :data="events" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="eventType" label="事件类型" width="120">
          <template #default="scope">
            <el-tag :type="getEventTypeTag(scope.row.eventType)">
              {{ getEventTypeName(scope.row.eventType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deviceName" label="设备" width="150" />
        <el-table-column prop="payload" label="事件内容" min-width="200">
          <template #default="scope">
            <div class="event-content">
              {{ formatEventContent(scope.row) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="severity" label="严重程度" width="100">
          <template #default="scope">
            <el-tag :type="getSeverityType(scope.row.severity)" size="small">
              {{ getSeverityName(scope.row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" width="120">
          <template #default="scope">
            <span v-if="scope.row.lng && scope.row.lat">
              {{ scope.row.lng.toFixed(4) }}, {{ scope.row.lat.toFixed(4) }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="occurredAt" label="发生时间" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.occurredAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="receivedAt" label="接收时间" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.receivedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="processingStatus" label="处理状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.processingStatus)" size="small">
              {{ getStatusName(scope.row.processingStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetails(scope.row)">详情</el-button>
            <el-button 
              size="small" 
              type="danger" 
              v-if="hasPermission('event:delete')"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          @current-change="loadEvents"
          @size-change="handleSizeChange"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
        />
      </div>
    </el-card>

    <!-- 事件详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      title="事件详情" 
      width="60%"
    >
      <event-detail :event="currentEvent" v-if="currentEvent" />
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Filter } from '@element-plus/icons-vue'
import EventDetail from '@/components/EventDetail.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)
const showFilter = ref(true)
const detailDialogVisible = ref(false)
const events = ref([])
const currentEvent = ref(null)

// 设备选项（模拟数据）
const deviceOptions = ref([
  { id: 1, name: '路口RSU设备' },
  { id: 2, name: '东侧摄像头' },
  { id: 3, name: '北侧雷达' }
])

const filter = ref({
  keyword: '',
  eventType: '',
  deviceId: '',
  severity: '',
  dateRange: []
})

const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

onMounted(() => {
  loadEvents()
})

const loadEvents = async () => {
  loading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      events.value = [
        {
          id: 1001,
          eventType: 'CONGESTION',
          deviceId: 1,
          deviceName: '路口RSU设备',
          payload: { vehicleCount: 45, speedAvg: 8.7, lane: 2 },
          severity: 'HIGH',
          lng: 121.5234,
          lat: 31.2215,
          occurredAt: new Date('2024-01-15T10:30:00'),
          receivedAt: new Date('2024-01-15T10:30:05'),
          processingStatus: 'PROCESSED'
        },
        {
          id: 1002,
          eventType: 'PEDESTRIAN_RED_LIGHT',
          deviceId: 2,
          deviceName: '东侧摄像头',
          payload: { count: 3, direction: 'north', crosswalk: 'A' },
          severity: 'MEDIUM',
          lng: 121.5240,
          lat: 31.2218,
          occurredAt: new Date('2024-01-15T10:25:00'),
          receivedAt: new Date('2024-01-15T10:25:03'),
          processingStatus: 'PROCESSED'
        },
        {
          id: 1003,
          eventType: 'CONTRAFLOW',
          deviceId: 3,
          deviceName: '北侧雷达',
          payload: { vehicleType: 'car', speed: 60, duration: 12 },
          severity: 'CRITICAL',
          lng: 121.5228,
          lat: 31.2220,
          occurredAt: new Date('2024-01-15T10:15:00'),
          receivedAt: new Date('2024-01-15T10:15:02'),
          processingStatus: 'NEW'
        }
      ]
      pagination.value.total = events.value.length
      loading.value = false
    }, 800)
  } catch (error) {
    ElMessage.error('加载事件列表失败')
    loading.value = false
  }
}

const resetFilter = () => {
  filter.value = {
    keyword: '',
    eventType: '',
    deviceId: '',
    severity: '',
    dateRange: []
  }
  loadEvents()
}

const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.current = 1
  loadEvents()
}

const viewDetails = (event) => {
  currentEvent.value = event
  detailDialogVisible.value = true
}

const handleDelete = async (event) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除事件 #${event.id} 吗?此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // 模拟API调用
    events.value = events.value.filter(e => e.id !== event.id)
    ElMessage.success('删除事件成功')
  } catch (error) {
    ElMessage.info('取消删除')
  }
}

const handleExport = () => {
  ElMessage.info('导出功能待实现')
}

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
    'CONTRAFLOW': 'danger',
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
    'CRITICAL': 'danger'
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

const formatEventContent = (event) => {
  switch (event.eventType) {
    case 'CONGESTION':
      return `车辆数: ${event.payload.vehicleCount}, 平均速度: ${event.payload.speedAvg}km/h`
    case 'PEDESTRIAN_RED_LIGHT':
      return `人数: ${event.payload.count}, 方向: ${event.payload.direction}`
    case 'CONTRAFLOW':
      return `车型: ${event.payload.vehicleType}, 速度: ${event.payload.speed}km/h`
    default:
      return JSON.stringify(event.payload)
  }
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const hasPermission = (permission) => {
  // 这里简化处理，实际应根据用户角色和权限判断
  return userStore.user.role === 'TENANT_ADMIN' || userStore.user.role === 'OPS'
}
</script>

<style scoped>
.event-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.event-content {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>