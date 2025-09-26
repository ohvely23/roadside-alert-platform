<template>
  <div class="alert-management">
    <div class="page-header">
      <h2>告警中心</h2>
      <div class="header-actions">
        <el-button @click="handleBulkAck" :disabled="selectedAlerts.length === 0">
          <el-icon><check /></el-icon>
          批量确认
        </el-button>
        <el-button @click="handleBulkResolve" :disabled="selectedAlerts.length === 0">
          <el-icon><circle-check /></el-icon>
          批量解决
        </el-button>
        <el-button type="primary" @click="showFilter = !showFilter">
          <el-icon><filter /></el-icon>
          筛选
        </el-button>
      </div>
    </div>

    <el-card>
      <!-- 筛选区域 -->
      <div class="filter-section" v-if="showFilter">
        <el-row :gutter="15">
          <el-col :span="6">
            <el-input
              v-model="filter.keyword"
              placeholder="搜索告警标题"
              clearable
            />
          </el-col>
          <el-col :span="6">
            <el-select v-model="filter.status" placeholder="状态筛选" clearable multiple>
              <el-option label="新建" value="OPEN" />
              <el-option label="已确认" value="ACKED" />
              <el-option label="已解决" value="RESOLVED" />
              <el-option label="已忽略" value="IGNORED" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filter.severity" placeholder="严重程度" clearable multiple>
              <el-option label="信息" value="INFO" />
              <el-option label="次要" value="MINOR" />
              <el-option label="主要" value="MAJOR" />
              <el-option label="严重" value="CRITICAL" />
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
              <el-button type="primary" @click="loadAlerts">搜索</el-button>
              <el-button @click="resetFilter">重置</el-button>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 告警列表 -->
      <el-table 
        :data="alerts" 
        v-loading="loading" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="告警标题" min-width="200" />
        <el-table-column prop="deviceName" label="设备" width="120" />
        <el-table-column prop="ruleName" label="触发规则" width="150" />
        <el-table-column prop="severity" label="严重程度" width="100">
          <template #default="scope">
            <el-tag :type="getSeverityType(scope.row.severity)" size="small">
              {{ getSeverityName(scope.row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="occurCount" label="发生次数" width="90" />
        <el-table-column prop="firstSeenAt" label="首次发生" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.firstSeenAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastSeenAt" label="最后发生" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.lastSeenAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetails(scope.row)">详情</el-button>
            <el-button 
              size="small" 
              v-if="scope.row.status === 'OPEN'" 
              @click="handleAck(scope.row)"
            >
              确认
            </el-button>
            <el-button 
              size="small" 
              type="success" 
              v-if="scope.row.status === 'ACKED'" 
              @click="handleResolve(scope.row)"
            >
              解决
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
          @current-change="loadAlerts"
          @size-change="handleSizeChange"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
        />
      </div>
    </el-card>

    <!-- 告警详情对话框 -->
    <alert-detail-dialog
      v-model="detailDialogVisible"
      :alert="currentAlert"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, CircleCheck, Filter } from '@element-plus/icons-vue'
import AlertDetailDialog from '@/components/AlertDetailDialog.vue'

const loading = ref(false)
const showFilter = ref(true)
const detailDialogVisible = ref(false)
const alerts = ref([])
const selectedAlerts = ref([])
const currentAlert = ref(null)

// 设备选项（模拟数据）
const deviceOptions = ref([
  { id: 1, name: '路口RSU设备' },
  { id: 2, name: '东侧摄像头' },
  { id: 3, name: '北侧雷达' }
])

const filter = ref({
  keyword: '',
  status: [],
  severity: [],
  deviceId: '',
  dateRange: []
})

const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

onMounted(() => {
  loadAlerts()
})

const loadAlerts = async () => {
  loading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      alerts.value = [
        {
          id: 2001,
          title: '东侧路口拥堵告警',
          deviceId: 1,
          deviceName: '路口RSU设备',
          ruleId: 1,
          ruleName: '拥堵检测规则',
          severity: 'MAJOR',
          status: 'OPEN',
          occurCount: 3,
          firstSeenAt: new Date('2024-01-15T10:30:00'),
          lastSeenAt: new Date('2024-01-15T10:35:00'),
          eventId: 1001
        },
        {
          id: 2002,
          title: '北侧雷达信号异常',
          deviceId: 3,
          deviceName: '北侧雷达',
          ruleId: 2,
          ruleName: '设备健康检测规则',
          severity: 'MINOR',
          status: 'ACKED',
          occurCount: 1,
          firstSeenAt: new Date('2024-01-15T10:25:00'),
          lastSeenAt: new Date('2024-01-15T10:25:00'),
          eventId: 1002
        },
        {
          id: 2003,
          title: '西侧摄像头离线',
          deviceId: 2,
          deviceName: '东侧摄像头',
          ruleId: 3,
          ruleName: '设备离线检测规则',
          severity: 'CRITICAL',
          status: 'OPEN',
          occurCount: 1,
          firstSeenAt: new Date('2024-01-15T10:15:00'),
          lastSeenAt: new Date('2024-01-15T10:15:00'),
          eventId: null
        },
        {
          id: 2004,
          title: '南侧逆行检测',
          deviceId: 1,
          deviceName: '路口RSU设备',
          ruleId: 4,
          ruleName: '逆行检测规则',
          severity: 'MAJOR',
          status: 'RESOLVED',
          occurCount: 5,
          firstSeenAt: new Date('2024-01-15T09:30:00'),
          lastSeenAt: new Date('2024-01-15T10:10:00'),
          eventId: 1003
        }
      ]
      pagination.value.total = alerts.value.length
      loading.value = false
    }, 800)
  } catch (error) {
    ElMessage.error('加载告警列表失败')
    loading.value = false
  }
}

const resetFilter = () => {
  filter.value = {
    keyword: '',
    status: [],
    severity: [],
    deviceId: '',
    dateRange: []
  }
  loadAlerts()
}

const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.current = 1
  loadAlerts()
}

const handleSelectionChange = (selection) => {
  selectedAlerts.value = selection
}

const viewDetails = (alert) => {
  currentAlert.value = alert
  detailDialogVisible.value = true
}

const handleAck = async (alert) => {
  try {
    await ElMessageBox.confirm(
      `确定要确认告警 "${alert.title}" 吗?`,
      '确认告警',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    
    // 模拟API调用
    alert.status = 'ACKED'
    ElMessage.success('告警已确认')
  } catch (error) {
    ElMessage.info('取消操作')
  }
}

const handleResolve = async (alert) => {
  try {
    await ElMessageBox.confirm(
      `确定要解决告警 "${alert.title}" 吗?`,
      '解决告警',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    
    // 模拟API调用
    alert.status = 'RESOLVED'
    ElMessage.success('告警已解决')
  } catch (error) {
    ElMessage.info('取消操作')
  }
}

const handleBulkAck = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要确认选中的 ${selectedAlerts.value.length} 个告警吗?`,
      '批量确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    
    // 模拟API调用
    selectedAlerts.value.forEach(alert => {
      if (alert.status === 'OPEN') {
        alert.status = 'ACKED'
      }
    })
    ElMessage.success('告警已批量确认')
    selectedAlerts.value = []
  } catch (error) {
    ElMessage.info('取消操作')
  }
}

const handleBulkResolve = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要解决选中的 ${selectedAlerts.value.length} 个告警吗?`,
      '批量解决',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    
    // 模拟API调用
    selectedAlerts.value.forEach(alert => {
      if (alert.status === 'ACKED') {
        alert.status = 'RESOLVED'
      }
    })
    ElMessage.success('告警已批量解决')
    selectedAlerts.value = []
  } catch (error) {
    ElMessage.info('取消操作')
  }
}

const getSeverityName = (severity) => {
  const severityMap = {
    'INFO': '信息',
    'MINOR': '次要',
    'MAJOR': '主要',
    'CRITICAL': '严重'
  }
  return severityMap[severity] || severity
}

const getSeverityType = (severity) => {
  const typeMap = {
    'INFO': 'info',
    'MINOR': 'warning',
    'MAJOR': 'danger',
    'CRITICAL': 'danger'
  }
  return typeMap[severity] || 'info'
}

const getStatusName = (status) => {
  const statusMap = {
    'OPEN': '新建',
    'ACKED': '已确认',
    'RESOLVED': '已解决',
    'IGNORED': '已忽略'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
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
.alert-management {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>