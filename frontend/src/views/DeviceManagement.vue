<template>
  <div class="device-management-container">
    <!-- 顶部操作栏 -->
    <div class="header">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入设备名称搜索"
        style="width: 240px;"
        :prefix-icon="Search"
        clearable
      />
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加设备
      </el-button>
    </div>

    <!-- 设备列表表格 -->
    <el-table :data="filteredDevices" border stripe style="margin: 20px 0;">
      <el-table-column prop="name" label="设备名称" width="200" />
      <el-table-column prop="type" label="设备类型" width="150">
        <template #default="{ row }">
          <el-tag :type="row.type === 'camera' ? 'success' : row.type === 'radar' ? 'warning' : 'info'">
            {{ typeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="设备状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 'online' ? 'success' : 'danger'">
            {{ row.status === 'online' ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastOnlineTime" label="最后在线时间" width="200" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="info" size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="deleteDevice(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-sizes="[10, 20, 30]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredTotal"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加/编辑设备对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="540px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入设备名称" />
        </el-form-item>

        <el-form-item label="设备类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择设备类型" clearable>
            <el-option label="摄像头" value="camera" />
            <el-option label="雷达" value="radar" />
            <el-option label="传感器" value="sensor" />
          </el-select>
        </el-form-item>

        <el-form-item label="设备描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入设备描述"
            :rows="3"
            clearable
          />
        </el-form-item>

        <el-form-item label="设备状态" prop="status">
          <el-switch
            v-model="form.status"
            active-value="online"
            inactive-value="offline"
            active-text="在线"
            inactive-text="离线"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDevice">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

// 搜索关键词
const searchKeyword = ref('')

// 模拟设备数据
const devices = reactive([
  {
    id: 1,
    name: '路口摄像头1',
    type: 'camera',
    status: 'online',
    lastOnlineTime: '2025-09-17 14:30:00',
    description: '路口A的监控摄像头'
  },
  {
    id: 2,
    name: '路边传感器1',
    type: 'sensor',
    status: 'offline',
    lastOnlineTime: '2025-09-16 18:00:00',
    description: '监测温湿度的传感器'
  },
  {
    id: 3,
    name: '停车场摄像头1',
    type: 'camera',
    status: 'online',
    lastOnlineTime: '2025-09-17 15:00:00',
    description: '停车场入口的摄像头'
  }
])

// 响应式数据
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const dialogTitle = ref('添加设备')
const formRef = ref(null)

const form = reactive({
  id: '',
  name: '',
  type: '',
  description: '',
  status: 'online',
  lastOnlineTime: ''
})

const rules = reactive({
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择设备类型', trigger: 'change' }]
})

// 过滤 + 分页
const filtered = computed(() => {
  const kw = (searchKeyword.value || '').trim().toLowerCase()
  if (!kw) return devices
  return devices.filter(d => (d.name || '').toLowerCase().includes(kw))
})

const filteredTotal = computed(() => filtered.value.length)

const filteredDevices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.value.slice(start, end)
})

// 生命周期钩子：初始化数据
onMounted(() => {
  // 这里可以调用API获取真实设备数据，替换模拟数据
  // fetchDevices()
})

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 打开添加对话框
const openAddDialog = () => {
  dialogTitle.value = '添加设备'
  resetForm()
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (row) => {
  dialogTitle.value = '编辑设备'
  form.id = row.id
  form.name = row.name
  form.type = row.type
  form.description = row.description
  form.status = row.status
  form.lastOnlineTime = row.lastOnlineTime || ''
  dialogVisible.value = true
}

// 保存设备（添加/编辑）
const saveDevice = async () => {
  await formRef.value?.validate()
  if (form.id) {
    // 编辑设备
    const index = devices.findIndex(item => item.id === form.id)
    if (index !== -1) {
      devices[index] = { ...devices[index], ...form }
      ElMessage.success('设备编辑成功')
    }
  } else {
    // 添加设备
    form.id = devices.length ? Math.max(...devices.map(d => d.id)) + 1 : 1
    form.lastOnlineTime = new Date().toLocaleString()
    devices.push({ ...form })
    ElMessage.success('设备添加成功')
  }
  dialogVisible.value = false
}

// 删除设备
const deleteDevice = (id) => {
  ElMessageBox.confirm('确定要删除该设备吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const index = devices.findIndex(item => item.id === id)
      if (index !== -1) {
        devices.splice(index, 1)
        ElMessage.success('设备删除成功')
      }
    })
    .catch(() => {
      ElMessage.info('取消删除')
    })
}

// 工具函数
const resetForm = () => {
  form.id = ''
  form.name = ''
  form.type = ''
  form.description = ''
  form.status = 'online'
  form.lastOnlineTime = ''
}

const typeLabel = (t) => {
  if (t === 'camera') return '摄像头'
  if (t === 'radar') return '雷达'
  if (t === 'sensor') return '传感器'
  return t || '未知'
}

// 模拟获取设备数据的函数（真实环境用）
// import axios from 'axios'
// const fetchDevices = async () => {
//   try {
//     const { data } = await axios.get('/api/devices')
//     devices.splice(0, devices.length, ...data)
//   } catch (error) {
//     ElMessage.error('获取设备数据失败：' + error.message)
//   }
// }
</script>

<style scoped>
.device-management-container {
  padding: 20px;
}

.header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>