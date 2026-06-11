import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    authPersistStorage,
    clearAuthStorage,
    setAuthRememberMe
} from '@/utils/auth-storage'

export const useAuthStore = defineStore('auth', () => {
    // 状态
    const accessToken = ref('')
    const user = ref(null)
    const lastVisitedRoute = ref(null)  // 保存最后访问的路由。

    // 计算属性
    const isAuthenticated = computed(() => !!accessToken.value)

    // 设置认证信息（仅对象传参）
    const setAuth = ({ token = '', user: userPayload = null, rememberMe = false } = {}) => {
        setAuthRememberMe(rememberMe)
        accessToken.value = token
        user.value = userPayload
    }

    // 清除认证信息
    const clearAuth = () => {
        accessToken.value = ''
        user.value = null
        lastVisitedRoute.value = null
        clearAuthStorage()
    }

    // 保存最后访问的路由
    const setLastVisitedRoute = (route) => {
        // 只保存非登录页的路由。
        if (!route || route.path === '/login' || route.path === '/') return

        const routeSnapshot = {
            path: route.path,
            name: route.name,
            query: route.query,
            params: route.params
        }
        lastVisitedRoute.value = routeSnapshot
    }

    return {
        accessToken,
        user,
        lastVisitedRoute,
        isAuthenticated,
        setAuth,
        clearAuth,
        setLastVisitedRoute
    }
}, {
    // 记住我：勾选 localStorage，未勾选 sessionStorage。
    // 该配置需要安装并注册 Pinia 持久化插件后才会生效。
    persist: {
        storage: authPersistStorage,
        pick: ['accessToken', 'user', 'lastVisitedRoute']
    }
})
