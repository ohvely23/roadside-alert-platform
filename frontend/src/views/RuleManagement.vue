<template>
  <div class="rule-management">
    <div class="page-header">
      <h2>规则管理</h2>
      <el-button type="primary" @click="showRuleDialog('create')">
        <el-icon><plus /></el-icon>
        新建规则
      </el-button>
    </div>

    <el-card>
      <div class="filter-bar">
        <el-input
          v-model="filter.keyword"
          placeholder="搜索规则名称"
          style="width: 300px; margin-right: 15px;"
          clearable
          @keyup.enter="loadRules"
        >
          <template #append>
            <el-button @click="loadRules">
              <el-icon><search /></el-icon>
            </el-button>
          </template>
        </el-input>

        <el-select v-model="filter.enabled" placeholder="状态筛选" @change="loadRules" clearable>
          <el-option label="启用" :value="true" />
          <el-option label="禁用" :value="false" />
        </el-select>

        <el-select v-model="filter.scope" placeholder="作用域筛选" @change="loadRules" clearable>
          <el-option label="全局" value="GLOBAL" />
          <el-option label="设备组" value="GROUP" />
          <el-option label="设备" value="DEVICE" />
        </el-select>
      </div>

      <el-table :data="rules" v-loading="loading">
        <el-table-column prop="name" label="规则名称" />
        <el-table-column prop="exprType" label="表达式类型" width="120">
          <template #default="scope">
            <el-tag>{{ scope.row.exprType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="scope" label="作用域" width="120">
          <template #default="scope">
            {{ getScopeName(scope.row.scope) }}
          </template>
        </el-table-column>
        <el-table-column prop="scopeRefName" label="作用对象" width="150" />
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="scope">
            <el-tag :type="getPriorityType(scope.row.priority)" size="small">
              {{ scope.row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="80">
          <template #default="scope">
            <el-switch
              v-model="scope.row.enabled"
              @change="toggleRuleStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="showRuleDialog('edit', scope.row)">
              编辑
            </el-button>
            <el-button size="small" @click="testRule(scope.row)">
              测试
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
          @current-change="loadRules"
          @size-change="handleSizeChange"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
        />
      </div>
    </el-card>

    <!-- 规则编辑对话框 -->
    <rule-dialog
      v-model="ruleDialogVisible"
      :rule="currentRule"
      :mode="dialogMode"
      @success="handleRuleDialogSuccess"
    />

    <!-- 规则测试对话框 -->
    <rule-test-dialog
      v-model="testDialogVisible"
      :rule="currentRule"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import RuleDialog from '@/components/RuleDialog.vue'
import RuleTestDialog from '@/components/RuleTestDialog.vue'

const loading = ref(false)
const ruleDialogVisible = ref(false)
const testDialogVisible = ref(false)
const dialogMode = ref('create')
const currentRule = ref(null)
const rules = ref([])

const filter = ref({
  keyword: '',
  enabled: null,
  scope: ''
})

const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

onMounted(() => {
  loadRules()
})

const loadRules = async () => {
  loading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      rules.value = [
        {
          id: 1,
          name: '拥堵检测规则',
          exprType: 'SpEL',
          exprText: '#event.eventType == \'CONGESTION\' and T(java.lang.Double).parseDouble(#event.payload.speedAvg) < 10',
          scope: 'GLOBAL',
          scopeRefName: '全局',
          scopeRefId: null,
          priority: 1,
          enabled: true,
          geofenceType: 'NONE',
          geofenceParams: null,
          createdAt: new Date('2024-01-10')
        },
        {
          id: 2,
          name: '逆行检测规则',
          exprType: 'SpEL',
          exprText: '#event.eventType == \'CONTRAFLOW\' and #device.type == \'CAMERA\'',
          scope: 'DEVICE',
          scopeRefName: '东侧摄像头',
          scopeRefId: 2,
          priority: 2,
          enabled: true,
          geofenceType: 'NONE',
          geofenceParams: null,
          createdAt: new Date('2024-01-12')
        },
        {
          id: 3,
          name: '行人闯红灯规则',
          exprType: 'SpEL',
          exprText: '#event.eventType == \'PEDESTRIAN_RED_LIGHT\' and #event.payload.count > 2',
          scope: 'GROUP',
          scopeRefName: '核心区域设备组',
          scopeRefId: 1,
          priority: 3,
          enabled: false,
          geofenceType: 'CIRCLE',
          geofenceParams: { center: [121.523, 31.221], radius: 500 },
          createdAt: new Date('2024-01-15')
        }
      ]
      pagination.value.total = rules.value.length
      loading.value = false
    }, 500)
  } catch (error) {
    ElMessage.error('加载规则列表失败')
    loading.value = false
  }
}

const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.current = 1
  loadRules()
}

const showRuleDialog = (mode, rule = null) => {
  dialogMode.value = mode
  currentRule.value = rule ? { ...rule } : {
    name: '',
    exprType: 'SpEL',
    exprText: '',
    scope: 'GLOBAL',
    scopeRefId: null,
    priority: 1,
    enabled: true,
    geofenceType: 'NONE',
    geofenceParams: null
  }
  ruleDialogVisible.value = true
}

const testRule = (rule) => {
  currentRule.value = { ...rule }
  testDialogVisible.value = true
}

const handleRuleDialogSuccess = () => {
  ruleDialogVisible.value = false
  loadRules()
  ElMessage.success(dialogMode.value === 'create' ? '规则创建成功' : '规则更新成功')
}

const toggleRuleStatus = async (rule) => {
  try {
    const action = rule.enabled ? '启用' : '禁用'
    // 模拟API调用
    ElMessage.success(`规则已${action}`)
  } catch (error) {
    // 失败时恢复切换前的状态
    rule.enabled = !rule.enabled
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (rule) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除规则 "${rule.name}" 吗?此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // 模拟API调用
    rules.value = rules.value.filter(r => r.id !== rule.id)
    ElMessage.success('删除规则成功')
  } catch (error) {
    ElMessage.info('取消删除')
  }
}

const getScopeName = (scope) => {
  const scopeMap = {
    'GLOBAL': '全局',
    'GROUP': '设备组',
    'DEVICE': '设备'
  }
  return scopeMap[scope] || scope
}

const getPriorityType = (priority) => {
  if (priority <= 1) return 'danger'
  if (priority <= 3) return 'warning'
  return 'info'
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
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