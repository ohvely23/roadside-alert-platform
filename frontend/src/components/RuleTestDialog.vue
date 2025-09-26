<template>
  <el-dialog 
    v-model="visible" 
    title="规则测试" 
    width="600px"
    :before-close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="测试参数" prop="params">
        <el-input 
          v-model="form.params" 
          type="textarea" 
          placeholder="请输入测试参数（JSON格式）" 
          rows="5"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submitTest">提交测试</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const visible = ref(false)
const formRef = ref(null)

const form = reactive({
  params: '{"key": "value"}' // 默认测试参数
})

const rules = reactive({
  params: [{ required: true, message: '请输入测试参数', trigger: 'blur' }]
})

// 打开对话框
const open = () => {
  visible.value = true
}

// 关闭对话框
const handleClose = () => {
  formRef.value.resetFields()
  visible.value = false
}

// 提交测试
const submitTest = async () => {
  await formRef.value.validate()
  // 模拟测试请求（替换为真实接口）
  setTimeout(() => {
    ElMessage.success('测试成功！')
    handleClose()
  }, 1000)
}

// 暴露方法给父组件
defineExpose({
  open
})
</script>