<template>
  <el-dialog v-model="visible" title="创建工单" width="500px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="工单标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入工单标题" />
      </el-form-item>
      <el-form-item label="工单类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择工单类型">
          <el-option label="故障报修" value="repair" />
          <el-option label="安装调试" value="installation" />
          <el-option label="投诉建议" value="complaint" />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-select v-model="form.priority" placeholder="请选择优先级">
          <el-option label="低" value="low" />
          <el-option label="中" value="medium" />
          <el-option label="高" value="high" />
          <el-option label="紧急" value="urgent" />
        </el-select>
      </el-form-item>
      <el-form-item label="工单内容" prop="content">
        <el-input type="textarea" v-model="form.content" rows="4" placeholder="请输入工单内容" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const visible = ref(false)
const formRef = ref(null) // 添加表单引用

const form = ref({
  title: '',
  type: '',
  priority: 'medium',
  content: ''
})

const rules = ref({
  title: [{ required: true, message: '请输入工单标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择工单类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入工单内容', trigger: 'blur' }]
})

// 打开对话框
const open = () => {
  // 重置表单数据
  form.value = { 
    title: '', 
    type: '', 
    priority: 'medium', 
    content: '' 
  }
  
  // 重置表单验证状态（如果表单已被验证过）
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  visible.value = true
}

// 提交表单
const submit = () => {
  // 表单验证
  formRef.value.validate(valid => {
    if (valid) {
      // 表单验证通过后提交
      console.log('提交工单数据:', form.value)
      
      // 这里模拟提交成功
      ElMessage.success('工单创建成功')
      visible.value = false
      
      // 实际项目中调用API
      // createTicket(form.value).then(() => { ... })
    } else {
      // 表单验证失败
      ElMessage.warning('请填写完整信息')
      return false
    }
  })
}

// 暴露open方法供父组件调用
defineExpose({ open })
</script>

<style scoped>
/* 添加一些样式优化 */
.el-select, .el-textarea {
  width: 100%;
}
</style>