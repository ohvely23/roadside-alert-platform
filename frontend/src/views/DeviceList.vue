<!-- frontend/src/views/DeviceManagement.vue -->
<template>
  <div class="device-list">
    <div class="page-header">
      <h2>设备管理</h2>
      <el-button type="primary" @click="showDeviceDialog('create')">
        <el-icon><plus /></el-icon>
        添加设备
      </el-button>
    </div>

    <el-card>
      <div class="filter-bar">
        <el-input
          v-model="filter.keyword"
          placeholder="搜索设备名称或SN"
          style="width: 300px; margin-right: 15px;"
          @keyup.enter="loadDevices"
        >
          <template #append>
            <el-button @click="loadDevices">
              <el-icon><search /></el-icon>
            </el-button>
          </template>
        </el-input>

        <el-select v-model="filter.status" placeholder="状态筛选" @change="loadDevices" clearable>
          <el-option label="全部" value="" />
          <el-option label="活跃" value="ACTIVE" />
          <el-option label="离线" value="OFFLINE" />
          <el-option label="新建" value="NEW" />
          <el-option label="禁用" value="BANNED" />
        </el-select>

        <el-select v-model="filter.type" placeholder="类型筛选" @change="loadDevices" clearable>
          <el-option label="全部" value="" />
          <el-option label="RSU" value="RSU" />
          <el-option label="摄像头" value="CAMERA" />
          <el-option label="毫米波雷达" value="MMWAVE" />
          <el-option label="其他" value="OTHER" />
        </el-select>
      </div>

      <el-table :data="devices" v-loading="loading">
        <el-table-column prop="deviceSn" label="设备SN" width="120" />
        <el-table-column prop="name" label="设备名称" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag>{{ getDeviceTypeName(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="firmwareVer" label="固件版本" width="100" />
        <el-table-column prop="lastSeenAt" label="最后心跳" width="150">
          <template #default="scope">
            {{ formatTime(scope.row.lastSeenAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="150">
          <template #default="scope">
            {{ formatTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="showDeviceDialog('edit', scope.row)">
              编辑
            </el-button>
            <el-button 
              size="small" 
              :type="scope.row.status === 'ACTIVE' ? 'warning' : 'success'"
              @click="toggleDeviceStatus(scope.row)"
            >
              {{ scope.row.status === 'ACTIVE' ? '禁用' : '启用' }}
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          @current-change="loadDevices"
          @size-change="loadDevices"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
        />
      </div>
    </el-card>

    <!-- 设备编辑对话框 -->
    <device-dialog
      v-model="dialogVisible"
      :device="currentDevice"
      :mode="dialogMode"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import DeviceDialog from '@/components/DeviceDialog.vue'

const loading = ref(false)
const devices = ref([])
const dialogVisible = ref(false)
const dialogMode = ref('create')
const currentDevice = ref(null)

const filter = ref({
  keyword: '',
  status: '',
  type: ''
})

const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

onMounted(() => {
  loadDevices()
})

const loadDevices = async () => {
  loading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      devices.value = [
        {
          id: 1,
          deviceSn: 'RSU-001',
          name: '路口RSU设备',
          type: 'RSU',
          status: 'ACTIVE',
          firmwareVer: 'v1.2.3',
          lastSeenAt: new Date(),
          createdAt: new Date('2024-01-15')
        },
        {
          id: 2,
          deviceSn: 'CAM-001',
          name: '东侧摄像头',
          type: 'CAMERA',
          status: 'ACTIVE',
          firmwareVer: 'v2.1.0',
          lastSeenAt: new Date(Date.now() - 300000),
          createdAt: new Date('2024-01-20')
        },
        {
          id: 3,
          deviceSn: 'RADAR-001',
          name: '北侧雷达',
          type: 'MMWAVE',
          status: 'OFFLINE',
          firmwareVer: 'v1.5.2',
          lastSeenAt: new Date(Date.now() - 3600000),
          createdAt: new Date('2024-02-01')
        }
      ]
      pagination.value.total = 3
      loading.value = false
    }, 500)
  } catch (error) {
    ElMessage.error('加载设备列表失败')
    loading.value = false
  }
}

const showDeviceDialog = (mode, device = null) => {
  dialogMode.value = mode
  currentDevice.value = device ? { ...device } : {
    deviceSn: '',
    name: '',
    type: 'RSU',
    status: 'NEW'
  }
  dialogVisible.value = true
}

const handleDialogSuccess = () => {
  dialogVisible.value = false
  loadDevices()
  ElMessage.success(dialogMode.value === 'create' ? '设备添加成功' : '设备更新成功')
}

const toggleDeviceStatus = async (device) => {
  const newStatus = device.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE'
  const action = newStatus === 'ACTIVE' ? '启用' : '禁用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}设备 "${device.name}" 吗?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟API调用
    ElMessage.success(`${action}设备成功`)
    device.status = newStatus
  } catch (error) {
    ElMessage.info('取消操作')
  }
}

const handleDelete = async (device) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除设备 "${device.name}" 吗?此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // 模拟API调用
    ElMessage.success('删除设备成功')
    devices.value = devices.value.filter(d => d.id !== device.id)
  } catch (error) {
    ElMessage.info('取消删除')
  }
}

const getDeviceTypeName = (type) => {
  const typeMap = {
    'RSU': 'RSU设备',
    'CAMERA': '摄像头',
    'MMWAVE': '毫米波雷达',
    'OTHER': '其他设备'
  }
  return typeMap[type] || type
}

const getStatusName = (status) => {
  const statusMap = {
    'NEW': '新建',
    'ACTIVE': '活跃',
    'OFFLINE': '离线',
    'BANNED': '禁用'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    'ACTIVE': 'success',
    'OFFLINE': 'warning',
    'NEW': 'info',
    'BANNED': 'danger'
  }
  return typeMap[status] || 'info'
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString()
}
</script>

<style scoped>
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