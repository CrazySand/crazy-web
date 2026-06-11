import { useAuthStore } from '@/stores'
import axios from 'axios'

export const API_CODE = {
    OK: 10000,
    BAD_REQUEST: 10400,
    UNAUTHORIZED: 10401,
    FORBIDDEN: 10403,
    NOT_FOUND: 10404,
    VALIDATION_ERROR: 10422,
    RATE_LIMITED: 10429,
    INTERNAL_ERROR: 10500
}

// 客户端请求层错误码（非后端业务码）。
export const CLIENT_CODE = {
    REQUEST_FAILED: -1
}

const DEFAULT_ERROR_MSG = '请求异常，请稍后重试'

// 统一客户端错误响应结构，与后端 build_response 的 msg 字段对齐。
const buildClientResponse = (msg, code = CLIENT_CODE.REQUEST_FAILED) => ({
    code,
    msg: msg || DEFAULT_ERROR_MSG,
    data: null
})

// Axios 实例（全局默认配置）
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000
})

// 响应拦截器只注册一次，避免 HMR/重复初始化导致重复处理。
let isResponseInterceptorSetup = false
// 并发请求同时命中 10401 时，仅首次执行清理与跳转。
let isHandlingUnauthorized = false

// 请求拦截器
axiosInstance.interceptors.request.use(
    config => {
        const authStore = useAuthStore()
        const token = String(authStore.accessToken || '').trim()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 初始化响应拦截器（在 main.js 中调用并传入 router）
export const setupInterceptors = (router) => {
    if (isResponseInterceptorSetup) {
        return
    }
    isResponseInterceptorSetup = true

    // 响应拦截器
    axiosInstance.interceptors.response.use(
        response => {
            const authStore = useAuthStore()
            // 业务错误码 10401：token 过期或未授权。
            if (response.data.code === API_CODE.UNAUTHORIZED) {
                if (!isHandlingUnauthorized) {
                    isHandlingUnauthorized = true
                    authStore.clearAuth()
                    router.push({ name: 'Login' }).finally(() => {
                        isHandlingUnauthorized = false
                    })
                }
                return Promise.reject(new Error('身份验证失败，请重新登录'))
            }
            return response.data
        },
        // 请求失败分流（HTTP 错误、网络异常、超时、其他异常）。
        error => {
            // 有响应：服务端返回了非 2xx 状态码。
            if (error.response) {
                const status = error.response.status
                const serverMessage = error.response.data.msg
                const message = serverMessage || `请求失败（HTTP ${status}）`
                return Promise.reject(new Error(message))
            }

            // 有请求但无响应：断网、超时、跨域拦截等网络层异常。
            if (error.request) {
                if (error.code === 'ECONNABORTED') {
                    return Promise.reject(new Error('请求超时，请稍后重试'))
                }
                return Promise.reject(new Error('网络异常，请检查网络连接'))
            }

            // 其他异常：请求配置错误或未知错误。
            return Promise.reject(new Error(error.message || '请求异常，请稍后重试'))
        }
    )
}

const safeRequest = async (fn) => {
    try {
        return await fn()
    } catch (error) {
        return buildClientResponse(error.message)
    }
}

// 统一构建请求配置，收敛各 HTTP 方法的重复逻辑。
const buildConfig = ({ params, data, timeout } = {}) => {
    const config = {}
    if (params) config.params = params
    if (data !== undefined) config.data = data
    if (timeout != null) config.timeout = timeout
    return config
}

// 单入口分发：对外调用保持一致，对内适配 axios 不同方法签名差异。
const requestByMethod = (method, url, { params, data, timeout } = {}) => {
    const config = buildConfig({ params, data, timeout })
    return safeRequest(() => {
        if (method === 'get' || method === 'delete') {
            return axiosInstance[method](url, config)
        }
        return axiosInstance[method](url, data, config)
    })
}

const get = (url, params = {}, timeout = null) => {
    return requestByMethod('get', url, { params, timeout })
}

const post = (url, data = null, timeout = null) => {
    return requestByMethod('post', url, { data, timeout })
}

const put = (url, data = null, timeout = null) => {
    return requestByMethod('put', url, { data, timeout })
}

const patch = (url, data = null, timeout = null) => {
    return requestByMethod('patch', url, { data, timeout })
}

const del = (url, options = {}) => {
    return requestByMethod('delete', url, options)
}

export default {
    get,
    post,
    put,
    patch,
    delete: del
}