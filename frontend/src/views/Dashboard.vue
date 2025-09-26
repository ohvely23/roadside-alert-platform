<!-- frontend/src/views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <h2>系统概览</h2>
    
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="color: #409EFF;">
              <el-icon><monitor /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.deviceCount }}</div>
              <div class="stat-label">总设备数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="color: #67C23A;">
              <el-icon><check /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.onlineRate }}%</div>
              <div class="stat-label">设备在线率</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="color: #E6A23C;">
              <el-icon><warning /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.activeAlerts }}</div>
              <div class="stat-label">活跃告警</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="color: #F56C6C;">
              <el-icon><ticket /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.openTickets }}</div>
              <div class="stat-label">待处理工单</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-section">
      <el-col :span="12">
        <el-card header="事件趋势">
          <div ref="eventChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="告警分布">
          <div ref="alertChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="recent-section">
      <el-col :span="12">
        <el-card header="最近告警">
          <el-table :data="recentAlerts" height="250">
            <el-table-column prop="title" label="告警标题" />
            <el-table-column prop="severity" label="级别" width="80">
              <template #default="scope">
                <el-tag :type="getSeverityType(scope.row.severity)" size="small">
                  {{ scope.row.severity }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="时间" width="120" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="系统状态">
          <div class="system-status">
            <div class="status-item">
              <span class="label">事件处理</span>
              <el-tag type="success">正常</el-tag>
            </div>
            <div class="status-item">
              <span class="label">规则引擎</span>
              <el-tag type="success">正常</el-tag>
            </div>
            <div class="status-item">
              <span class="label">消息队列</span>
              <el-tag type="success">正常</el-tag>
            </div>
            <div class="status-item">
              <span class="label">数据库</span>
              <el-tag type="success">正常</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

const stats = ref({
  deviceCount: 124,
  onlineRate: 98.2,
  activeAlerts: 8,
  openTickets: 5
})

const recentAlerts = ref([
  { id: 1, title: '东侧路口拥堵告警', severity: 'MAJOR', createdAt: '10:30' },
  { id: 2, title: '北侧雷达信号异常', severity: 'MINOR', createdAt: '10:25' },
  { id: 3, title: '西侧摄像头离线', severity: 'CRITICAL', createdAt: '10:15' },
  { id: 4, title: '南侧逆行检测', severity: 'MAJOR', createdAt: '10:10' },
  { id: 5, title: '中央区域设备重启', severity: 'INFO', createdAt: '10:05' }
])

const eventChart = ref(null)
const alertChart = ref(null)

onMounted(() => {
  initCharts()
})

const initCharts = () => {
  // 事件趋势图表
  const eventChartInstance = echarts.init(eventChart.value)
  eventChartInstance.setOption({
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [120, 200, 150, 80, 70, 110],
      type: 'line',
      smooth: true
    }]
  })

  // 告警分布图表
  const alertChartInstance = echarts.init(alertChart.value)
  alertChartInstance.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '告警分布',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: '拥堵告警' },
        { value: 735, name: '设备离线' },
        { value: 580, name: '逆行检测' },
        { value: 484, name: '信号异常' },
        { value: 300, name: '其他告警' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  })
}

const getSeverityType = (severity) => {
  const typeMap = {
    'CRITICAL': 'danger',
    'MAJOR': 'warning',
    'MINOR': 'info',
    'INFO': 'success'
  }
  return typeMap[severity] || 'info'
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 40px;
  margin-right: 15px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.charts-section {
  margin-bottom: 20px;
}

.recent-section {
  margin-bottom: 20px;
}

.system-status {
  padding: 10px 0;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.status-item:last-child {
  border-bottom: none;
}

.status-item .label {
  font-weight: 500;
}
</style>