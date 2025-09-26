<template>
  <el-dialog 
    v-model="visible" 
    :title="mode === 'create' ? '新建规则' : '编辑规则'" 
    width="800px"
    :before-close="handleClose"
  >
    <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
      <el-form-item label="规则名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入规则名称" />
      </el-form-item>
      
      <el-form-item label="表达式类型" prop="exprType">
        <el-select v-model="form.exprType" placeholder="请选择表达式类型">
          <el-option label="SpEL" value="SpEL" />
          <el-option label="MVEL" value="MVEL" />
          <el-option label="JavaScript" value="JS" />
          <el-option label="SQL" value="SQL" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="作用域" prop="scope">
        <el-select v-model="form.scope" placeholder="请选择作用域" @change="handleScopeChange">
          <el-option label="全局" value="GLOBAL" />
          <el-option label="设备组" value="GROUP" />
          <el-option label="设备" value="DEVICE" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="作用对象" prop="scopeRefId" v-if="form.scope !== 'GLOBAL'">
        <el-select v-model="form.scopeRefId" :placeholder="scopePlaceholder">
          <el-option
            v-for="item in scopeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="优先级" prop="priority">
        <el-input-number v-model="form.priority" :min="1" :max="10" />
        <span class="tip-text">数字越小优先级越高</span>
      </el-form-item>
      
      <el-form-item label="地理围栏" prop="geofenceType">
        <el-select v-model="form.geofenceType" placeholder="请选择地理围栏类型">
          <el-option label="无" value="NONE" />
          <el-option label="圆形" value="CIRCLE" />
          <el-option label="多边形" value="POLYGON" />
        </el-select>
      </el-form-item>
      
      <el-form-item 
        v-if="form.geofenceType !== 'NONE'" 
        label="围栏参数" 
        prop="geofenceParams"
      >
        <el-input
          v-model="geofenceParamsText"
          type="textarea"
          :rows="3"
          placeholder="请输入围栏参数（JSON格式）"
        />
      </el-form-item>
      
      <el-form-item label="规则表达式" prop="exprText">
        <el-input
          v-model="form.exprText"
          type="textarea"
          :rows="4"
          placeholder="请输入规则表达式"
        />
      </el-form-item>
      
      <el-form-item label="启用规则">
        <el-switch v-model="form.enabled" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="submitForm">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  rule: Object,
  mode: String
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref(null)
const form = ref({
  name: '',
  exprType: 'SpEL',
  exprText: '',
  scope: 'GLOBAL',
  scopeRefId: null,
  priority: 1,
  enabled: true,
  geofenceType: 'NONE',
  geofenceParams: null
})

const rules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  exprType: [{ required: true, message: '请选择表达式类型', trigger: 'change' }],
  exprText: [{ required: true, message: '请输入规则表达式', trigger: 'blur' }]
}

// 模拟作用域选项数据
const deviceOptions = ref([
  { id: 1, name: '东侧摄像头' },
  { id: 2, name: '北侧雷达' },
  { id: 3, name: '路口RSU设备' }
])

const groupOptions = ref([
  { id: 1, name: '核心区域设备组' },
  { id: 2, name: '外围设备组' }
])

const scopeOptions = computed(() => {
  if (form.value.scope === 'DEVICE') return deviceOptions.value
  if (form.value.scope === 'GROUP') return groupOptions.value
  return []
})

const scopePlaceholder = computed(() => {
  if (form.value.scope === 'DEVICE') return '请选择设备'
  if (form.value.scope === 'GROUP') return '请选择设备组'
  return ''
})

const geofenceParamsText = computed({
  get: () => form.value.geofenceParams ? JSON.stringify(form.value.geofenceParams, null, 2) : '',
  set: (value) => {
    try {
      form.value.geofenceParams = value ? JSON.parse(value) : null
    } catch (e) {
      // 解析错误时保持原值
    }
  }
})

watch(() => props.rule, (newRule) => {
  if (newRule) {
    form.value = { ...newRule }
  } else {
    resetForm()
  }
}, { immediate: true })

const handleScopeChange = (value) => {
  if (value === 'GLOBAL') {
    form.value.scopeRefId = null
  }
}

const resetForm = () => {
  form.value = {
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
}

const handleClose = () => {
  visible.value = false
}

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 模拟API调用
    setTimeout(() => {
      ElMessage.success('保存成功')
      emit('success')
      visible.value = false
    }, 500)
  } catch (error) {
    ElMessage.error('表单验证失败，请检查输入')
  }
}
</script>

<style scoped>
.tip-text {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}
</style>