import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'nprogress/nprogress.css'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores'
import { setupInterceptors } from './utils/request'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
// 首屏路由守卫执行前先恢复 auth 持久化状态。
useAuthStore(pinia)

app.use(router)
app.use(ElementPlus)

setupInterceptors(router)

app.mount('#app')