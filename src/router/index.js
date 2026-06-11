import { createRouter, createWebHashHistory } from 'vue-router'
import NProgress from 'nprogress'
import { useAuthStore } from '@/stores'
import { asleep } from '@/utils'

NProgress.configure({
    showSpinner: false
})

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        meta: { requireAuth: false }
    },
    {
        path: '/',
        name: 'Layout',
        component: () => import('@/views/layout/index.vue'),
        meta: { requireAuth: true },
        children: [
            {
                path: 'home',
                name: 'Home',
                component: () => import('@/views/home/index.vue'),
                meta: { title: '首页' }
            },
            {
                path: 'user',
                name: 'User',
                component: () => import('@/views/user/index.vue'),
                meta: { title: '用户管理' }
            },
            {
                path: 'permission',
                name: 'Permission',
                component: () => import('@/views/permission/index.vue'),
                redirect: '/permission/role',
                meta: { title: '权限管理' },
                children: [
                    {
                        path: 'role',
                        name: 'PermissionRole',
                        component: () => import('@/views/permission/role.vue'),
                        meta: { title: '角色管理' }
                    },
                    {
                        path: 'menu',
                        name: 'PermissionMenu',
                        component: () => import('@/views/permission/menu.vue'),
                        meta: { title: '菜单管理' }
                    },
                    {
                        path: 'api',
                        name: 'PermissionApi',
                        component: () => import('@/views/permission/api.vue'),
                        meta: { title: '接口权限' }
                    }
                ]
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/login'
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

const isRestorableRoute = (path) => {
    return path && path !== '/login' && path !== '/'
}

// 将持久化的 lastVisitedRoute 转为可导航目标，无记录时回首页。
const resolveLastVisitedRoute = (authStore) => {
    const last = authStore.lastVisitedRoute
    if (!isRestorableRoute(last?.path)) {
        return { path: '/home' }
    }
    return { path: last.path, query: last.query ?? {} }
}

router.beforeEach((to) => {
    const authStore = useAuthStore()

    if (to.meta.requireAuth && !authStore.isAuthenticated) {
        return { name: 'Login' }
    }

    if (to.path === '/login' && authStore.isAuthenticated) {
        return { ...resolveLastVisitedRoute(authStore), replace: true }
    }

    // 已登录访问根路径时，优先恢复上次页面；无记录再回首页。
    if (to.path === '/' && authStore.isAuthenticated) {
        return { ...resolveLastVisitedRoute(authStore), replace: true }
    }

    NProgress.start()
    return true
})

router.afterEach(async (to) => {
    const authStore = useAuthStore()

    if (authStore.isAuthenticated) {
        authStore.setLastVisitedRoute(to)
    }

    await asleep(200)
    NProgress.done()
})

export default router
