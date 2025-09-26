<template>
  <div class="analytics">
    <div class="page-header">
      <h2>智能统计分析</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出报表
        </el-button>
        <el-button @click="showDateFilter = !showDateFilter">
          <el-icon><Calendar /></el-icon>
          时间筛选
        </el-button>
        <el-button type="success" @click="showAiAnalysis = !showAiAnalysis">
          <el-icon><TrendCharts /></el-icon>
          AI分析
        </el-button>
      </div>
    </div>

    <!-- 时间筛选 -->
    <el-card v-if="showDateFilter" style="margin-bottom: 20px;">
      <div class="date-filter">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 300px;"
        />
        <el-select v-model="selectedDeviceType" placeholder="设备类型" clearable style="width: 150px;">
          <el-option label="全部设备" value="all" />
          <el-option label="RSU设备" value="rsu" />
          <el-option label="摄像头" value="camera" />
          <el-option label="雷达" value="radar" />
        </el-select>
        <el-select v-model="selectedSeverity" placeholder="告警级别" clearable style="width: 150px;">
          <el-option label="全部级别" value="all" />
          <el-option label="信息" value="info" />
          <el-option label="次要" value="minor" />
          <el-option label="主要" value="major" />
          <el-option label="严重" value="critical" />
        </el-select>
        <el-button type="primary" @click="loadData">应用筛选</el-button>
        <el-button @click="resetDateFilter">重置</el-button>
      </div>
      
      <!-- 筛选标签 -->
      <div class="filter-tags" v-if="activeFilters.length > 0">
        <el-tag
          v-for="filter in activeFilters"
          :key="filter.key"
          closable
          @close="removeFilter(filter.key)"
        >
          {{ filter.label }}: {{ filter.value }}
        </el-tag>
      </div>
    </el-card>

    <!-- AI分析面板 -->
    <el-card v-if="showAiAnalysis" class="ai-analysis-panel">
      <template #header>
        <div style="display: flex; align-items: center;">
          <el-icon style="margin-right: 8px;"><TrendCharts /></el-icon>
          <span>AI智能分析</span>
        </div>
      </template>
      
      <div class="analysis-controls">
        <el-select v-model="aiAnalysisType" placeholder="分析类型" style="width: 200px;">
          <el-option label="整体性能分析" value="performance" />
          <el-option label="异常检测分析" value="anomaly" />
          <el-option label="趋势预测分析" value="trend" />
          <el-option label="优化建议分析" value="optimization" />
        </el-select>
        <el-button type="primary" :loading="aiLoading" @click="runAiAnalysis">
          <el-icon><Search /></el-icon>
          开始分析
        </el-button>
      </div>
      
      <div v-if="aiAnalysisResult" class="analysis-result">
        <h4>AI分析结果</h4>
        <p v-html="aiAnalysisResult"></p>
        
        <div class="recommendation" v-if="aiRecommendations.length > 0">
          <strong>优化建议：</strong>
          <ul style="margin-top: 5px; margin-left: 20px;">
            <li v-for="(rec, index) in aiRecommendations" :key="index">{{ rec }}</li>
          </ul>
        </div>
      </div>
    </el-card>

    <!-- AI洞察 -->
    <el-card class="ai-insights" v-if="aiInsights.length > 0">
      <template #header>
        <div style="display: flex; align-items: center;">
          <el-icon style="margin-right: 8px;"><InfoFilled /></el-icon>
          <span>AI关键洞察</span>
        </div>
      </template>
      
      <div v-for="(insight, index) in aiInsights" :key="index" class="insight-card" :class="insight.type">
        <div class="insight-header">
          <el-icon class="insight-icon" :color="getInsightColor(insight.type)">
            <component :is="getInsightIcon(insight.type)" />
          </el-icon>
          <div class="insight-title">{{ insight.title }}</div>
        </div>
        <div class="insight-content">{{ insight.content }}</div>
      </div>
    </el-card>

    <!-- 概览统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.deviceCount }}</div>
              <div class="stat-label">设备总数</div>
              <div class="stat-trend trend-up">
                <el-icon><Top /></el-icon>
                <span>较上周 +5.2%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon success">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.onlineRate }}%</div>
              <div class="stat-label">设备在线率</div>
              <div class="stat-trend trend-down">
                <el-icon><Bottom /></el-icon>
                <span>较上周 -0.8%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon warning">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.eventCount }}</div>
              <div class="stat-label">事件总数</div>
              <div class="stat-trend trend-up">
                <el-icon><Top /></el-icon>
                <span>较上周 +12.3%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon danger">
              <el-icon><Ticket /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.alertCount }}</div>
              <div class="stat-label">告警总数</div>
              <div class="stat-trend trend-down">
                <el-icon><Bottom /></el-icon>
                <span>较上周 -3.5%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-section">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>事件类型分布</span>
              <el-button text @click="toggleChartFullscreen('eventTypeChart')">
                <el-icon><FullScreen /></el-icon>
              </el-button>
            </div>
          </template>
          <div ref="eventTypeChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>告警严重程度分布</span>
              <el-button text @click="toggleChartFullscreen('alertSeverityChart')">
                <el-icon><FullScreen /></el-icon>
              </el-button>
            </div>
          </template>
          <div ref="alertSeverityChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-section">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>每日事件趋势</span>
              <el-button text @click="toggleChartFullscreen('dailyEventChart')">
                <el-icon><FullScreen /></el-icon>
              </el-button>
            </div>
          </template>
          <div ref="dailyEventChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>工单处理时效</span>
              <el-button text @click="toggleChartFullscreen('ticketSlaChart')">
                <el-icon><FullScreen /></el-icon>
              </el-button>
            </div>
          </template>
          <div ref="ticketSlaChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新增性能指标图表 -->
    <el-row :gutter="20" class="charts-section">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>设备性能指标</span>
              <el-button text @click="toggleChartFullscreen('devicePerformanceChart')">
                <el-icon><FullScreen /></el-icon>
              </el-button>
            </div>
          </template>
          <div ref="devicePerformanceChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>告警响应时间分析</span>
              <el-button text @click="toggleChartFullscreen('responseTimeChart')">
                <el-icon><FullScreen /></el-icon>
              </el-button>
            </div>
          </template>
          <div ref="responseTimeChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-card>
      <template #header>
        <div class="tab-actions">
          <span>详细数据</span>
          <el-button type="primary" text @click="exportTableData">导出当前数据</el-button>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="设备统计" name="device">
          <el-table :data="deviceStats" style="width: 100%" v-loading="tableLoading">
            <el-table-column prop="deviceName" label="设备名称" />
            <el-table-column prop="eventCount" label="事件数量" sortable />
            <el-table-column prop="alertCount" label="告警数量" sortable />
            <el-table-column prop="uptimeRatio" label="在线率" sortable>
              <template #default="scope">
                <div class="progress-cell">
                  <el-progress 
                    :percentage="scope.row.uptimeRatio * 100" 
                    :show-text="false" 
                    class="progress-bar"
                    :color="getUptimeColor(scope.row.uptimeRatio)"
                  />
                  <span>{{ (scope.row.uptimeRatio * 100).toFixed(2) }}%</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button link type="primary" @click="viewDeviceDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="告警统计" name="alert">
          <el-table :data="alertStats" style="width: 100%" v-loading="tableLoading">
            <el-table-column prop="ruleName" label="规则名称" />
            <el-table-column prop="alertCount" label="告警数量" sortable />
            <el-table-column prop="avgResponseTime" label="平均响应时间(分钟)" sortable />
            <el-table-column prop="resolutionRate" label="解决率" sortable>
              <template #default="scope">
                {{ (scope.row.resolutionRate * 100).toFixed(2) }}%
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getAlertStatusType(scope.row.alertCount)">
                  {{ getAlertStatusText(scope.row.alertCount) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="工单统计" name="ticket">
          <el-table :data="ticketStats" style="width: 100%" v-loading="tableLoading">
            <el-table-column prop="assigneeName" label="负责人" />
            <el-table-column prop="ticketCount" label="工单数量" sortable />
            <el-table-column prop="avgResolutionTime" label="平均解决时间(分钟)" sortable />
            <el-table-column prop="slaComplianceRate" label="SLA合规率" sortable>
              <template #default="scope">
                {{ (scope.row.slaComplianceRate * 100).toFixed(2) }}%
              </template>
            </el-table-column>
            <el-table-column label="绩效评级" width="100">
              <template #default="scope">
                <el-rate 
                  v-model="scope.row.performanceRating" 
                  disabled 
                  show-score 
                  text-color="#ff9900" 
                  score-template="{value}"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      
      <div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          显示第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalItems"
          layout="prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { 
  Download, Calendar, Monitor, Connection, Warning, Ticket,
  TrendCharts, Search, InfoFilled, Top, Bottom, FullScreen
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 响应式数据
const showDateFilter = ref(true)
const showAiAnalysis = ref(true)
const activeTab = ref('device')
const dateRange = ref([new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()])
const selectedDeviceType = ref('all')
const selectedSeverity = ref('all')
const activeFilters = ref([])
const aiAnalysisType = ref('performance')
const aiLoading = ref(false)
const aiAnalysisResult = ref('')
const aiRecommendations = ref([])
const aiInsights = ref([])
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(40)
const totalPages = ref(4)

// 图表引用
const eventTypeChart = ref(null)
const alertSeverityChart = ref(null)
const dailyEventChart = ref(null)
const ticketSlaChart = ref(null)
const devicePerformanceChart = ref(null)
const responseTimeChart = ref(null)

// 图表实例
let eventTypeChartInstance = null
let alertSeverityChartInstance = null
let dailyEventChartInstance = null
let ticketSlaChartInstance = null
let devicePerformanceChartInstance = null
let responseTimeChartInstance = null

// 模拟数据
const stats = ref({
  deviceCount: 124,
  onlineRate: 98.2,
  eventCount: 2456,
  alertCount: 348
})

const deviceStats = ref([
  { deviceName: '路口RSU设备', eventCount: 456, alertCount: 78, uptimeRatio: 0.99 },
  { deviceName: '东侧摄像头', eventCount: 892, alertCount: 124, uptimeRatio: 0.97 },
  { deviceName: '北侧雷达', eventCount: 324, alertCount: 56, uptimeRatio: 0.98 },
  { deviceName: '西侧RSU设备', eventCount: 278, alertCount: 42, uptimeRatio: 0.96 },
  { deviceName: '南侧摄像头', eventCount: 506, alertCount: 89, uptimeRatio: 0.95 }
])

const alertStats = ref([
  { ruleName: '拥堵检测规则', alertCount: 156, avgResponseTime: 45, resolutionRate: 0.92 },
  { ruleName: '逆行检测规则', alertCount: 78, avgResponseTime: 32, resolutionRate: 0.88 },
  { ruleName: '设备离线检测', alertCount: 64, avgResponseTime: 120, resolutionRate: 0.75 },
  { ruleName: '行人闯红灯规则', alertCount: 50, avgResponseTime: 28, resolutionRate: 0.95 },
  { ruleName: '超速检测规则', alertCount: 42, avgResponseTime: 38, resolutionRate: 0.90 }
])

const ticketStats = ref([
  { assigneeName: '张三', ticketCount: 24, avgResolutionTime: 85, slaComplianceRate: 0.92, performanceRating: 4.5 },
  { assigneeName: '李四', ticketCount: 18, avgResolutionTime: 105, slaComplianceRate: 0.85, performanceRating: 3.8 },
  { assigneeName: '王五', ticketCount: 32, avgResolutionTime: 68, slaComplianceRate: 0.96, performanceRating: 4.7 },
  { assigneeName: '赵六', ticketCount: 15, avgResolutionTime: 92, slaComplianceRate: 0.88, performanceRating: 4.0 }
])

// 生命周期
onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
  generateAiInsights()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  // 销毁图表实例
  if (eventTypeChartInstance) eventTypeChartInstance.dispose()
  if (alertSeverityChartInstance) alertSeverityChartInstance.dispose()
  if (dailyEventChartInstance) dailyEventChartInstance.dispose()
  if (ticketSlaChartInstance) ticketSlaChartInstance.dispose()
  if (devicePerformanceChartInstance) devicePerformanceChartInstance.dispose()
  if (responseTimeChartInstance) responseTimeChartInstance.dispose()
})

// 方法
const loadData = async () => {
  tableLoading.value = true
  // 更新筛选标签
  updateActiveFilters()
  
  // 模拟API调用
  setTimeout(() => {
    initCharts()
    tableLoading.value = false
  }, 1000)
}

const updateActiveFilters = () => {
  activeFilters.value = []
  
  if (dateRange.value && dateRange.value.length === 2) {
    const start = dateRange.value[0].toLocaleDateString()
    const end = dateRange.value[1].toLocaleDateString()
    activeFilters.value.push({
      key: 'dateRange',
      label: '时间范围',
      value: `${start} 至 ${end}`
    })
  }
  
  if (selectedDeviceType.value && selectedDeviceType.value !== 'all') {
    activeFilters.value.push({
      key: 'deviceType',
      label: '设备类型',
      value: getDeviceTypeLabel(selectedDeviceType.value)
    })
  }
  
  if (selectedSeverity.value && selectedSeverity.value !== 'all') {
    activeFilters.value.push({
      key: 'severity',
      label: '告警级别',
      value: getSeverityLabel(selectedSeverity.value)
    })
  }
}

const getDeviceTypeLabel = (type) => {
  const map = {
    'rsu': 'RSU设备',
    'camera': '摄像头',
    'radar': '雷达'
  }
  return map[type] || type
}

const getSeverityLabel = (severity) => {
  const map = {
    'info': '信息',
    'minor': '次要',
    'major': '主要',
    'critical': '严重'
  }
  return map[severity] || severity
}

const removeFilter = (key) => {
  if (key === 'dateRange') {
    dateRange.value = null
  } else if (key === 'deviceType') {
    selectedDeviceType.value = 'all'
  } else if (key === 'severity') {
    selectedSeverity.value = 'all'
  }
  
  loadData()
}

const resetDateFilter = () => {
  dateRange.value = [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()]
  selectedDeviceType.value = 'all'
  selectedSeverity.value = 'all'
  loadData()
}

const handleExport = () => {
  ElMessage.success('数据导出功能已触发')
  // 实际项目中这里会调用导出API
}

const exportTableData = () => {
  ElMessage.success(`正在导出${getActiveTabLabel()}数据`)
}

const getActiveTabLabel = () => {
  const map = {
    'device': '设备统计',
    'alert': '告警统计',
    'ticket': '工单统计'
  }
  return map[activeTab.value] || '数据'
}

const handleResize = () => {
  if (eventTypeChartInstance) eventTypeChartInstance.resize()
  if (alertSeverityChartInstance) alertSeverityChartInstance.resize()
  if (dailyEventChartInstance) dailyEventChartInstance.resize()
  if (ticketSlaChartInstance) ticketSlaChartInstance.resize()
  if (devicePerformanceChartInstance) devicePerformanceChartInstance.resize()
  if (responseTimeChartInstance) responseTimeChartInstance.resize()
}

const toggleChartFullscreen = (chartName) => {
  ElMessage.info(`全屏显示${chartName}图表`)
  // 实际项目中这里会实现全屏图表功能
}

const viewDeviceDetail = (device) => {
  ElMessage.info(`查看设备详情: ${device.deviceName}`)
}

const getUptimeColor = (ratio) => {
  if (ratio >= 0.98) return '#67C23A'
  if (ratio >= 0.95) return '#E6A23C'
  return '#F56C6C'
}

const getAlertStatusType = (count) => {
  if (count < 50) return 'success'
  if (count < 100) return 'warning'
  return 'danger'
}

const getAlertStatusText = (count) => {
  if (count < 50) return '正常'
  if (count < 100) return '关注'
  return '警告'
}

const handlePageChange = (page) => {
  currentPage.value = page
  // 实际项目中这里会重新加载对应页面的数据
  ElMessage.info(`加载第 ${page} 页数据`)
}

const runAiAnalysis = async () => {
  aiLoading.value = true
  aiAnalysisResult.value = ''
  aiRecommendations.value = []
  
  // 模拟AI分析API调用
  setTimeout(() => {
    const analysis = generateAiAnalysis(aiAnalysisType.value)
    aiAnalysisResult.value = analysis.result
    aiRecommendations.value = analysis.recommendations
    aiLoading.value = false
    
    ElMessage.success('AI分析完成')
  }, 2000)
}

const generateAiAnalysis = (type) => {
  const analyses = {
    performance: {
      result: `根据当前数据分析，系统<strong class="highlight">整体性能表现良好</strong>。设备在线率为<span class="highlight">${stats.value.onlineRate}%</span>，高于行业平均水平。但<span class="highlight">北侧雷达设备</span>的事件数量较上周增加了<span class="highlight">15%</span>，建议关注其运行状态。`,
      recommendations: [
        '优化北侧雷达设备的维护计划，增加巡检频率',
        '考虑对高事件频率设备进行硬件升级',
        '建立设备性能预警机制，提前发现潜在问题'
      ]
    },
    anomaly: {
      result: `检测到<span class="highlight">3个异常模式</span>：1) 周二上午9-11点事件数量异常增高；2) 西侧RSU设备告警响应时间超过阈值；3) 李四负责的工单平均解决时间有上升趋势。`,
      recommendations: [
        '调查周二事件高峰期的根本原因',
        '检查西侧RSU设备的网络连接状态',
        '为李四提供额外的技术培训或资源支持'
      ]
    },
    trend: {
      result: `基于历史数据预测，未来一周事件数量可能<span class="highlight">增加8-12%</span>，主要由于交通流量季节性增长。告警数量预计保持稳定，但<span class="highlight">设备离线检测告警</span>可能有小幅上升。`,
      recommendations: [
        '提前准备额外的事件处理资源',
        '加强设备健康状态监控',
        '考虑在高峰时段增加系统资源分配'
      ]
    },
    optimization: {
      result: `发现<span class="highlight">2个优化机会</span>：1) 通过调整告警规则阈值可减少15%的次要告警；2) 优化工单分配算法可提高SLA合规率约7%。`,
      recommendations: [
        '重新评估告警规则阈值设置',
        '实施智能工单分配系统',
        '建立持续优化机制，定期评估系统性能'
      ]
    }
  }
  
  return analyses[type] || analyses.performance
}

const generateAiInsights = () => {
  aiInsights.value = [
    {
      type: 'warning',
      title: '设备性能下降预警',
      content: '北侧雷达设备的事件数量本周增加15%，可能存在潜在问题。'
    },
    {
      type: 'danger',
      title: 'SLA合规风险',
      content: '李四负责的工单平均解决时间超出SLA标准15分钟，需要关注。'
    },
    {
      type: 'default',
      title: '性能优化机会',
      content: '通过调整告警阈值可减少15%的非关键告警，提升处理效率。'
    }
  ]
}

const getInsightColor = (type) => {
  const colors = {
    'default': '#409EFF',
    'warning': '#E6A23C',
    'danger': '#F56C6C'
  }
  return colors[type] || colors.default
}

const getInsightIcon = (type) => {
  const icons = {
    'default': 'InfoFilled',
    'warning': 'Warning',
    'danger': 'CircleCloseFilled'
  }
  return icons[type] || icons.default
}

const initCharts = () => {
  nextTick(() => {
    // 防止重复初始化引发内存泄露：先 dispose 再 init
    if (eventTypeChartInstance) eventTypeChartInstance.dispose()
    if (alertSeverityChartInstance) alertSeverityChartInstance.dispose()
    if (dailyEventChartInstance) dailyEventChartInstance.dispose()
    if (ticketSlaChartInstance) ticketSlaChartInstance.dispose()
    if (devicePerformanceChartInstance) devicePerformanceChartInstance.dispose()
    if (responseTimeChartInstance) responseTimeChartInstance.dispose()

    // 事件类型分布图
    if (eventTypeChart.value) {
      eventTypeChartInstance = echarts.init(eventTypeChart.value)
      eventTypeChartInstance.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'center'
        },
        series: [{
          name: '事件类型',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 18,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 1048, name: '拥堵事件' },
            { value: 735, name: '行人闯红灯' },
            { value: 580, name: '逆行事件' },
            { value: 484, name: '施工事件' },
            { value: 300, name: '其他事件' }
          ]
        }]
      })
    }

    // 告警严重程度分布图
    if (alertSeverityChart.value) {
      alertSeverityChartInstance = echarts.init(alertSeverityChart.value)
      alertSeverityChartInstance.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'center'
        },
        series: [{
          name: '告警严重程度',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          roseType: 'radius',
          itemStyle: {
            borderRadius: 5
          },
          label: {
            formatter: '{b|{b}}\n{c|{c}}',
            rich: {
              b: {
                fontSize: 12,
                lineHeight: 20
              },
              c: {
                fontSize: 14,
                fontWeight: 'bold',
                lineHeight: 20
              }
            }
          },
          data: [
            { value: 1048, name: '信息', itemStyle: { color: '#909399' } },
            { value: 735, name: '次要', itemStyle: { color: '#e6a23c' } },
            { value: 580, name: '主要', itemStyle: { color: '#f56c6c' } },
            { value: 300, name: '严重', itemStyle: { color: '#c45656' } }
          ]
        }]
      })
    }

    // 每日事件趋势图
    if (dailyEventChart.value) {
      dailyEventChartInstance = echarts.init(dailyEventChart.value)
      dailyEventChartInstance.setOption({
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['1月10日', '1月11日', '1月12日', '1月13日', '1月14日', '1月15日', '1月16日']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '事件数量',
          type: 'line',
          data: [120, 132, 101, 134, 90, 230, 210],
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#409EFF'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: 'rgba(64, 158, 255, 0.3)'
              }, {
                offset: 1,
                color: 'rgba(64, 158, 255, 0.1)'
              }]
            }
          },
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#409EFF',
            borderColor: '#fff',
            borderWidth: 2
          }
        }]
      })
    }

    // 工单处理时效图
    if (ticketSlaChart.value) {
      ticketSlaChartInstance = echarts.init(ticketSlaChart.value)
      ticketSlaChartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['平均解决时间', 'SLA时限']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['张三', '李四', '王五', '赵六', '钱七']
        },
        yAxis: {
          type: 'value',
          name: '分钟'
        },
        series: [{
          name: '平均解决时间',
          type: 'bar',
          data: [85, 105, 68, 92, 78],
          itemStyle: {
            color: '#409EFF',
            borderRadius: [5, 5, 0, 0]
          },
          barWidth: '40%'
        }, {
          name: 'SLA时限',
          type: 'line',
          data: [120, 120, 120, 120, 120],
          symbol: 'none',
          lineStyle: {
            color: '#F56C6C',
            type: 'dashed',
            width: 2
          }
        }]
      })
    }

    // 设备性能指标图
    if (devicePerformanceChart.value) {
      devicePerformanceChartInstance = echarts.init(devicePerformanceChart.value)
      devicePerformanceChartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['CPU使用率', '内存使用率', '网络负载']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['路口RSU', '东侧摄像头', '北侧雷达', '西侧RSU', '南侧摄像头']
        },
        yAxis: {
          type: 'value',
          name: '百分比(%)',
          max: 100
        },
        series: [
          {
            name: 'CPU使用率',
            type: 'bar',
            data: [65, 78, 45, 82, 60],
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '内存使用率',
            type: 'bar',
            data: [70, 65, 50, 75, 55],
            itemStyle: {
              color: '#67C23A'
            }
          },
          {
            name: '网络负载',
            type: 'line',
            yAxisIndex: 0,
            data: [45, 60, 35, 70, 40],
            itemStyle: {
              color: '#E6A23C'
            },
            lineStyle: {
              width: 3
            },
            symbol: 'circle',
            symbolSize: 8
          }
        ]
      })
    }

    // 告警响应时间分析图
    if (responseTimeChart.value) {
      responseTimeChartInstance = echarts.init(responseTimeChart.value)
      responseTimeChartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        toolbox: {
          feature: {
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ['line', 'bar'] },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        legend: {
          data: ['响应时间', '告警数量']
        },
        xAxis: [
          {
            type: 'category',
            data: ['拥堵检测', '逆行检测', '设备离线', '行人闯红灯', '超速检测'],
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '响应时间(分钟)',
            min: 0,
            max: 140,
            interval: 20
          },
          {
            type: 'value',
            name: '告警数量',
            min: 0,
            max: 200,
            interval: 40
          }
        ],
        series: [
          {
            name: '响应时间',
            type: 'bar',
            data: [45, 32, 120, 28, 38],
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '告警数量',
            type: 'line',
            yAxisIndex: 1,
            data: [156, 78, 64, 50, 42],
            itemStyle: {
              color: '#F56C6C'
            },
            lineStyle: {
              width: 3
            },
            symbol: 'circle',
            symbolSize: 8
          }
        ]
      })
    }
  })
}
</script>

<style scoped>
.analytics {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.date-filter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 15px;
}

.stat-icon {
  font-size: 40px;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background-color: rgba(64, 158, 255, 0.1);
}

.stat-icon.success {
  background-color: rgba(103, 194, 58, 0.1);
  color: var(--success-color);
}

.stat-icon.warning {
  background-color: rgba(230, 162, 60, 0.1);
  color: var(--warning-color);
}

.stat-icon.danger {
  background-color: rgba(245, 108, 108, 0.1);
  color: var(--danger-color);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.stat-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  margin-top: 5px;
}

.trend-up {
  color: var(--success-color);
}

.trend-down {
  color: var(--danger-color);
}

.charts-section {
  margin-bottom: 20px;
}

.ai-insights {
  margin-bottom: 20px;
}

.insight-card {
  margin-bottom: 15px;
  border-left: 4px solid var(--primary-color);
}

.insight-card.warning {
  border-left-color: var(--warning-color);
}

.insight-card.danger {
  border-left-color: var(--danger-color);
}

.insight-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.insight-icon {
  margin-right: 10px;
  font-size: 18px;
}

.insight-title {
  font-weight: 600;
  font-size: 16px;
}

.insight-content {
  color: #606266;
  line-height: 1.6;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.tab-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.data-table {
  margin-top: 15px;
}

.progress-cell {
  display: flex;
  align-items: center;
}

.progress-bar {
  flex: 1;
  margin-right: 10px;
}

.ai-analysis-panel {
  margin-top: 20px;
}

.analysis-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.analysis-result {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 15px;
  margin-top: 15px;
  border-left: 4px solid var(--primary-color);
}

.analysis-result h4 {
  margin-bottom: 10px;
  color: #303133;
}

.analysis-result p {
  line-height: 1.6;
  color: #606266;
}

.highlight {
  background-color: #fffacd;
  padding: 2px 4px;
  border-radius: 2px;
}

.recommendation {
  background-color: #f0f9ff;
  padding: 10px 15px;
  border-radius: 4px;
  margin-top: 10px;
  border-left: 3px solid var(--primary-color);
}

@media (max-width: 1200px) {
  .el-col-lg-12 {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .date-filter {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

<style>
:root {
  --primary-color: #409EFF;
  --success-color: #67C23A;
  --warning-color: #E6A23C;
  --danger-color: #F56C6C;
  --info-color: #909399;
  --bg-color: #f5f7fa;
  --card-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>