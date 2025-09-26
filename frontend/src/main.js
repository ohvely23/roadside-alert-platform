// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 不全量注册图标；各页面按需引入图标组件使用

const app = createApp(App)

console.log('Vue version:', app.version)
console.log('Element Plus version:', ElementPlus.version)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

const appMountElement = document.getElementById('app')
if (!appMountElement) {
  console.error('挂载元素 #app 不存在！请在 index.html 中添加 <div id="app"></div>')
} else {
  app.mount('#app')
}
