<template>
  <div class="ticket-management">
    <div class="page-header">
      <h2>工单系统</h2>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><plus /></el-icon>
        新建工单
      </el-button>
    </div>

    <el-card>
      <div class="filter-bar">
        <el-input
          v-model="filter.keyword"
          placeholder="搜索工单标题或描述"
          style="width: 300px; margin-right: 15px;"
          clearable
          @keyup.enter="loadTickets"
        >
          <template #append>
            <el-button @click="loadTickets">
              <el-icon><search /></el-icon>
            </el-button>
          </template>
        </el-input>

        <el-select v-model="filter.status" placeholder="状态筛选" @change="loadTickets" clearable multiple>
          <el-option label="新建" value="NEW" />
          <el-option label="已分配" value="ASSIGNED" />
          <el-option label="处理中" value="IN_PROGRESS" />
          <el-option label="已解决" value="RESOLVED" />
          <el-option label="已关闭" value="CLOSED" />
        </el-select>

        <el-select v-model="filter.priority" placeholder="优先级筛选" @change="loadTickets" clearable>
          <el-option label="低" value="LOW" />
          <el-option label="中" value="MEDIUM" />
          <el-option label="高" value="HIGH" />
          <el-option label="紧急" value="URGENT" />
        </el-select>

        <el-select v-model="filter.assignee" placeholder="负责人筛选" @change="loadTickets" clearable>
          <el-option
            v-for="user in userOptions"
            :key="user.id"
            :label="user.name"
            :value="user.id"
          />
        </el-select>
      </div>

      <el-table :data="tickets" v-loading="loading" style="width: 100%">
        <el-table-column prop="code" label="工单编号" width="120" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="alertTitle" label="关联告警" width="150" />
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="scope">
            <el-tag :type="getPriorityType(scope.row.priority)" size="small">
              {{ getPriorityName(scope.row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assigneeName" label="负责人" width="120" />
        <el-table-column prop="slaStatus" label="SLA状态" width="120">
          <template #default="scope">
            <el-tag :type="getSlaStatusType(scope.row.slaStatus)" size="small">
              {{ scope.row.slaStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="slaMinutes" label="SLA时限" width="100">
          <template #default="scope">
            {{ scope.row.slaMinutes }}分钟
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetails(scope.row)">详情</el-button>
            <el-button 
              size="small" 
              :type="getActionButtonType(scope.row.status)"
              @click="handleStatusChange(scope.row)"
            >
              {{ getActionButtonText(scope.row.status) }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          @current-change="loadTickets"
          @size-change="handleSizeChange"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
        />
      </div>
    </el-card>

    <!-- 工单详情对话框 -->
    <ticket-detail-dialog
      v-model="detailDialogVisible"
      :ticket="currentTicket"
      @status-change="handleTicketStatusChange"
    />

    <!-- 创建工单对话框 -->
    <ticket-create-dialog
      v-model="createDialogVisible"
      @success="handleCreateSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import TicketDetailDialog from '@/components/TicketDetailDialog.vue'
import TicketCreateDialog from '@/components/TicketCreateDialog.vue'

const loading = ref(false)
const detailDialogVisible = ref(false)
const createDialogVisible = ref(false)
const tickets = ref([])
const currentTicket = ref(null)

// 用户选项（模拟数据）
const userOptions = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
])

const filter = ref({
  keyword: '',
  status: [],
  priority: '',
  assignee: ''
})

const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

onMounted(() => {
  loadTickets()
})

const loadTickets = async () => {
  loading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      tickets.value = [
        {
          id: 3001,
          code: 'TKT-20240115-001',
          title: '东侧路口拥堵处理',
          alertId: 2001,
          alertTitle: '东侧路口拥堵告警',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          assigneeId: 1,
          assigneeName: '张三',
          slaMinutes: 120,
          slaStatus: 'IN_PROGRESS',
          createdAt: new Date('2024-01-15T10:35:00'),
          updatedAt: new Date('2024-01-15T11:15:00')
        },
        {
          id: 3002,
          code: 'TKT-20240115-002',
          title: '北侧雷达检修',
          alertId: 2002,
          alertTitle: '北侧雷达信号异常',
          priority: 'MEDIUM',
          status: 'ASSIGNED',
          assigneeId: 2,
          assigneeName: '李四',
          slaMinutes: 240,
          slaStatus: 'NORMAL',
          createdAt: new Date('2024-01-15T10:40:00'),
          updatedAt: new Date('2024-01-15T10:40:00')
        },
        {
          id: 3003,
          code: 'TKT-20240115-003',
          title: '西侧摄像头维修',
          alertId: 2003,
          alertTitle: '西侧摄像头离线',
          priority: 'URGENT',
          status: 'NEW',
          assigneeId: null,
          assigneeName: '-',
          slaMinutes: 60,
          slaStatus: 'WARNING',
          createdAt: new Date('2024-01-15T10:45:00'),
          updatedAt: new Date('2024-01-15T10:45:00')
        },
        {
          id: 3004,
          code: 'TKT-20240115-004',
          title: '南侧逆行事件处理',
          alertId: 2004,
          alertTitle: '南侧逆行检测',
          priority: 'HIGH',
          status: 'RESOLVED',
          assigneeId: 3,
          assigneeName: '王五',
          slaMinutes: 120,
          slaStatus: 'COMPLETED',
          createdAt: new Date('2024-01-15T09:40:00'),
          updatedAt: new Date('2024-01-15T10:20:00')
        }
      ]
      pagination.value.total = tickets.value.length
      loading.value = false
    }, 800)
  } catch (error) {
    ElMessage.error('加载工单列表失败')
    loading.value = false
  }
}

const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.current = 1
  loadTickets()
}

const viewDetails = (ticket) => {
  currentTicket.value = ticket
  detailDialogVisible.value = true
}

const showCreateDialog = () => {
  createDialogVisible.value = true
}

const handleCreateSuccess = () => {
  createDialogVisible.value = false
  loadTickets()
  ElMessage.success('工单创建成功')
}

const handleStatusChange = (ticket) => {
  // 根据当前状态决定下一步操作
  const statusActions = {
    'NEW': () => assignTicket(ticket),
    'ASSIGNED': () => startProgress(ticket),
    'IN_PROGRESS': () => resolveTicket(ticket),
    'RESOLVED': () => closeTicket(ticket)
  }
  
  const action = statusActions[ticket.status]
  if (action) {
    action()
  }
}

const assignTicket = async (ticket) => {
  // 模拟分配工单
  ticket.status = 'ASSIGNED'
  ticket.assigneeId = 1 // 默认分配给当前用户
  ticket.assigneeName = '张三'
  ElMessage.success('工单已分配')
}

const startProgress = async (ticket) => {
  // 模拟开始处理
  ticket.status = 'IN_PROGRESS'
  ElMessage.success('工单处理中')
}

const resolveTicket = async (ticket) => {
  // 模拟解决工单
  ticket.status = 'RESOLVED'
  ElMessage.success('工单已解决')
}

const closeTicket = async (ticket) => {
  // 模拟关闭工单
  ticket.status = 'CLOSED'
  ElMessage.success('工单已关闭')
}

const handleTicketStatusChange = (ticketId, newStatus) => {
  // 更新工单状态
  const ticket = tickets.value.find(t => t.id === ticketId)
  if (ticket) {
    ticket.status = newStatus
    ticket.updatedAt = new Date()
    loadTickets() // 重新加载以更新列表
  }
}

const getPriorityName = (priority) => {
  const priorityMap = {
    'LOW': '低',
    'MEDIUM': '中',
    'HIGH': '高',
    'URGENT': '紧急'
  }
  return priorityMap[priority] || priority
}

const getPriorityType = (priority) => {
  const typeMap = {
    'LOW': 'info',
    'MEDIUM': 'warning',
    'HIGH': 'danger',
    'URGENT': 'danger'
  }
  return typeMap[priority] || 'info'
}

const getStatusName = (status) => {
  const statusMap = {
    'NEW': '新建',
    'ASSIGNED': '已分配',
    'IN_PROGRESS': '处理中',
    'RESOLVED': '已解决',
    'CLOSED': '已关闭'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    'NEW': 'info',
    'ASSIGNED': 'warning',
    'IN_PROGRESS': 'info',
    'RESOLVED': 'success',
    'CLOSED': 'danger'
  }
  return typeMap[status] || 'info'
}

const getSlaStatusType = (slaStatus) => {
  const typeMap = {
    'NORMAL': 'success',
    'WARNING': 'warning',
    'CRITICAL': 'danger',
    'COMPLETED': 'info',
    'IN_PROGRESS': 'info'
  }
  return typeMap[slaStatus] || 'info'
}

const getActionButtonText = (status) => {
  const textMap = {
    'NEW': '分配',
    'ASSIGNED': '开始处理',
    'IN_PROGRESS': '解决',
    'RESOLVED': '关闭'
  }
  return textMap[status] || '查看'
}

const getActionButtonType = (status) => {
  const typeMap = {
    'NEW': 'primary',
    'ASSIGNED': 'warning',
    'IN_PROGRESS': 'success',
    'RESOLVED': 'danger'
  }
  return typeMap[status] || 'info'
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.ticket-management {
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