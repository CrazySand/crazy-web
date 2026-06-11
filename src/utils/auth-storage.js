/**
 * Auth 持久化 Storage 适配器。
 *
 * pinia-plugin-persistedstate 的 persist.storage 可传入任意普通对象，
 * 只要实现 getItem / setItem / removeItem 三个方法即可，不必是原生 localStorage。
 * 插件按这套接口读写数据；何时保存、JSON 序列化、刷新后恢复仍由插件负责。
 *
 * authPersistStorage 在此基础上，根据「记住我」将读写转发到 localStorage 或 sessionStorage。
 */

export const AUTH_REMEMBER_KEY = 'auth-remember-me'
// 与 useAuthStore('auth', ...) 的 store id 对应，用于清理持久化数据。
export const AUTH_STORE_KEY = 'auth'

const getTargetStorage = () => {
    const remember = localStorage.getItem(AUTH_REMEMBER_KEY) === 'true'
    return remember ? localStorage : sessionStorage
}

export const setAuthRememberMe = (rememberMe) => {
    localStorage.setItem(AUTH_REMEMBER_KEY, rememberMe ? 'true' : 'false')
}

export const clearAuthStorage = () => {
    localStorage.removeItem(AUTH_REMEMBER_KEY)
    sessionStorage.removeItem(AUTH_STORE_KEY)
    localStorage.removeItem(AUTH_STORE_KEY)
}

// 供 persist.storage 使用的适配器对象。
export const authPersistStorage = {
    getItem(key) {
        return getTargetStorage().getItem(key)
    },
    setItem(key, value) {
        const target = getTargetStorage()
        const other = target === localStorage ? sessionStorage : localStorage
        target.setItem(key, value)
        other.removeItem(key)
    },
    removeItem(key) {
        sessionStorage.removeItem(key)
        localStorage.removeItem(key)
    }
}
