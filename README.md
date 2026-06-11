# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## 前端存储方式对比

- 内存（如 Pinia 默认状态）：刷新页面丢失，关闭标签页丢失。
- `sessionStorage`：刷新页面保留，关闭当前标签页后清除，不和其他标签页共享。
- `localStorage`：刷新页面保留，关闭浏览器后仍保留，同源下多个标签页共享。

### 在 Store 中的常见写法

```js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    // 内存态（默认）：不进入 persist 的字段会只保存在内存中
    const accessToken = ref('')
    const tempState = ref('')
    const user = ref(null)

    const setAuth = (token, userInfo) => {
        accessToken.value = token
        user.value = userInfo
    }

    const clearAuth = () => {
        accessToken.value = ''
        user.value = null
        tempState.value = ''
    }

    return {
        accessToken,
        user,
        tempState,
        setAuth,
        clearAuth
    }
}, {
    persist: [
        // 存到 localStorage：长期保留（如 token、用户信息）
        {
            storage: localStorage,
            pick: ['accessToken', 'user']
        },
        // 存到 sessionStorage：同标签页刷新保留，关标签页清空
        {
            storage: sessionStorage,
            pick: ['tempState']
        }
    ]
})
```

> 说明：`persist` 需要安装并在 `main.js` 注册 Pinia 持久化插件后才会生效。

### 自定义 storage 适配器

`persist.storage` 不一定要传 `localStorage` / `sessionStorage`，也可以传**任意普通对象**，只要实现与浏览器 Storage 相同的三个方法：

| 方法 | 作用 |
|---|---|
| `getItem(key)` | 读取持久化数据 |
| `setItem(key, value)` | 写入持久化数据 |
| `removeItem(key)` | 删除持久化数据 |

插件只认这三个方法；**何时保存、JSON 序列化、刷新后恢复**仍由 `pinia-plugin-persistedstate` 负责，适配器只决定「数据最终落到哪里」。

本项目的 `src/utils/auth-storage.js` 中的 `authPersistStorage` 即此类适配器：对外满足上述接口，对内根据「记住我」转发到 `localStorage` 或 `sessionStorage`。在 store 中用法如下：

```js
import { authPersistStorage } from '@/utils/auth-storage'

export const useAuthStore = defineStore('auth', () => {
    // ...
}, {
    persist: {
        storage: authPersistStorage,
        pick: ['accessToken', 'user', 'lastVisitedRoute']
    }
})
```
