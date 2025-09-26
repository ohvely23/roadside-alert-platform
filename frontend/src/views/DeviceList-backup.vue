<template>
  <div class="device-list">
    <h2>设备管理</h2>
    <el-button type="primary" @click="handleAdd" style="margin-bottom: 20px;">添加设备</el-button>
    
    <el-table :data="devices" style="width: 100%">
      <el-table-column prop="deviceSn" label="设备SN" />
      <el-table-column prop="name" label="设备名称" />
      <el-table-column prop="type" label="类型">
        <template #default="scope">
          <el-tag>{{ scope.row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟设备数据
const mockDevices = [
  { id: 1, deviceSn: 'RSU-001', name: '路口RSU设备', type: 'RSU', status: 'ACTIVE' },
  { id: 2, deviceSn: 'CAM-001', name: '东侧摄像头', type: 'CAMERA', status: 'ACTIVE' },
  { id: 3, deviceSn: 'RADAR-001', name: '北侧雷达', type: 'MMWAVE', status: 'OFFLINE' },
  { id: 4, deviceSn: 'RSU-002', name: '西侧RSU设备', type: 'RSU', status: 'NEW' }
]

const devices = ref([])

onMounted(() => {
  loadDevices()
})

const loadDevices = async () => {
  // 模拟API调用
  setTimeout(() => {
    devices.value = mockDevices
  }, 500)
}

const getStatusType = (status) => {
  const statusMap = {
    'ACTIVE': 'success',
    'OFFLINE': 'warning',
    'NEW': 'info',
    'BANNED': 'danger'
  }
  return statusMap[status] || 'info'
}

const handleAdd = () => {
  ElMessage.info('添加设备功能待实现')
}

const handleEdit = (device) => {
  ElMessage.info(`编辑设备: ${device.name}`)
}

const handleDelete = async (device) => {
  try {
    await ElMessageBox.confirm(`确定要删除设备 "${device.name}" 吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    devices.value = devices.value.filter(d => d.id !== device.id)
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.info('取消删除')
  }
}
</script>

<style scoped>
.device-list {
  padding: 20px;
}
</style>