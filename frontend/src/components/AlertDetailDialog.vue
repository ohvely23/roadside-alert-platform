<template>
  <el-dialog v-model="visible" title="告警详情" width="600px">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="告警ID">{{ detail.id }}</el-descriptions-item>
      <el-descriptions-item label="告警级别">
        <el-tag :type="getLevelTag(detail.level)">{{ detail.level }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="告警内容">{{ detail.content }}</el-descriptions-item>
      <el-descriptions-item label="告警时间">{{ detail.time }}</el-descriptions-item>
      <el-descriptions-item label="告警设备">{{ detail.device }}</el-descriptions-item>
      <el-descriptions-item label="处理状态">
        <el-tag :type="detail.status === '已处理' ? 'success' : 'danger'">
          {{ detail.status }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="处理人" v-if="detail.status === '已处理'">
        {{ detail.handler }}
      </el-descriptions-item>
      <el-descriptions-item label="处理时间" v-if="detail.status === '已处理'">
        {{ detail.handleTime }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const detail = ref({
  id: '',
  level: '',
  content: '',
  time: '',
  device: '',
  status: '',
  handler: '',
  handleTime: ''
})

// 打开对话框并传入详情数据
const open = (alertDetail) => {
  detail.value = { ...alertDetail }
  visible.value = true
}

// 根据告警级别返回标签类型
const getLevelTag = (level) => {
  switch(level) {
    case '紧急': return 'danger'
    case '重要': return 'warning'
    case '一般': return 'info'
    default: return ''
  }
}

// 暴露open方法供父组件调用
defineExpose({ open })
</script>