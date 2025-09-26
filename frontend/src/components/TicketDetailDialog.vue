<template>
  <el-dialog v-model="visible" title="工单详情" width="600px">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="工单ID">{{ detail.id }}</el-descriptions-item>
      <el-descriptions-item label="工单标题">{{ detail.title }}</el-descriptions-item>
      <el-descriptions-item label="工单类型">{{ detail.type }}</el-descriptions-item>
      <el-descriptions-item label="优先级">
        <!-- 修复：正确绑定优先级标签类型（无多余符号，变量名正确） -->
        <el-tag :type="getPriorityTag(detail.priority)">{{ detail.priority }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="工单内容">{{ detail.content }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ detail.createTime }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="detail.status === '已处理' ? 'success' : 'danger'">{{ detail.status }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="处理人" v-if="detail.status === '已处理'">{{ detail.handler }}</el-descriptions-item>
      <el-descriptions-item label="处理时间" v-if="detail.status === '已处理'">{{ detail.handleTime }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

// 对话框显示状态
const visible = ref(false)

// 工单详情数据（需与父组件传递的字段一致）
const detail = ref({
  id: '',         // 工单ID
  title: '',      // 工单标题
  type: '',       // 工单类型（故障报修/安装调试/投诉建议）
  priority: '',   // 优先级（低/中/高/紧急）
  content: '',    // 工单内容
  createTime: '', // 创建时间
  status: '',     // 状态（已处理/未处理）
  handler: '',    // 处理人（状态为已处理时显示）
  handleTime: ''  // 处理时间（状态为已处理时显示）
})

// 打开对话框（父组件调用，传递工单详情）
const open = (ticketDetail) => {
  detail.value = { ...ticketDetail } // 复制数据到detail
  visible.value = true
}

// 根据优先级返回标签类型（与父组件逻辑一致）
const getPriorityTag = (priority) => {
  switch (priority) {
    case 'urgent': return 'danger'   // 紧急→红色
    case 'high': return 'warning'    // 高→黄色
    case 'medium': return 'info'     // 中→蓝色
    case 'low': return 'success'     // 低→绿色
    default: return ''
  }
}

// 暴露open方法给父组件调用
defineExpose({ open })
</script>

<style scoped>
/* 可选：优化标签样式 */
.el-tag {
  margin-right: 0; /* 取消标签右侧间距 */
}
</style>