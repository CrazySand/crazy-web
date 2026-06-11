<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import LayoutHeader from './LayoutHeader.vue'
import LayoutSidebar from './LayoutSidebar.vue'

const drawerVisible = ref(false)
const drawerKey = ref(0)
const isMobile = ref(false)
const isCollapsed = ref(false)

// 响应式断点：跨越阈值时才自动切换，避免 resize 中反复打架。
const BREAKPOINT_MOBILE = 768
const BREAKPOINT_COLLAPSE = 1200

const getRange = (width) => {
    if (width < BREAKPOINT_MOBILE) return 'mobile'
    if (width < BREAKPOINT_COLLAPSE) return 'tablet'
    return 'desktop'
}

let prevRange = null

const syncLayoutByWidth = () => {
    const range = getRange(window.innerWidth)
    if (range === prevRange) return
    prevRange = range

    if (range === 'mobile') {
        isMobile.value = true
    } else if (range === 'tablet') {
        isMobile.value = false
        isCollapsed.value = true
    } else {
        isMobile.value = false
        isCollapsed.value = false
    }
}

// 每次打开抽屉时递增 key，强制重新渲染侧边栏组件，避免状态残留。
const openDrawer = () => {
    drawerKey.value++
    drawerVisible.value = true
}

onMounted(() => {
    syncLayoutByWidth()
    window.addEventListener('resize', syncLayoutByWidth)
})

onUnmounted(() => {
    window.removeEventListener('resize', syncLayoutByWidth)
})

defineExpose({
    openDrawer
})
</script>

<template>
    <div class="layout">
        <div v-if="!isMobile" class="layout__sidebar">
            <LayoutSidebar v-model:collapsed="isCollapsed" />
        </div>

        <div class="layout__container">
            <div class="layout__header">
                <LayoutHeader :is-mobile="isMobile" @open-menu="openDrawer" />
            </div>

            <el-scrollbar class="layout__scrollbar">
                <div class="layout__main">
                    <router-view v-slot="{ Component }">
                        <transition name="page-transition" mode="out-in">
                            <component :is="Component" />
                        </transition>
                    </router-view>
                </div>
            </el-scrollbar>
        </div>

        <el-drawer
            v-model="drawerVisible"
            :with-header="false"
            direction="ltr"
            size="210px"
            class="layout__drawer"
        >
            <LayoutSidebar :key="`drawer-${drawerKey}`" :force-expand="true" />
        </el-drawer>
    </div>
</template>

<style scoped>
.layout {
    display: flex;
    height: 100vh;
}

.layout__sidebar {
    width: 210px;
    flex-shrink: 0;
    overflow: hidden;
    /* duration / easing 与 el-menu 内部过渡保持一致，确保宽度与高亮块同步动画。 */
    transition: width 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

/* 折叠状态显式 54px，与 pure-admin 一致。 */
.layout__sidebar:has(.el-menu--collapse) {
    width: 54px;
}

.layout__container {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: #f0f2f5;
}

.layout__header {
    height: 48px;
    background: #fff;
}

.layout__scrollbar {
    flex: 1;
    min-width: 0;
    min-height: 0;
}

.layout__main {
    padding: 24px;
    min-width: fit-content;
}

.page-transition-enter-active,
.page-transition-leave-active {
    transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
}

.page-transition-enter-from {
    opacity: 0;
    transform: translateX(-30px);
}

.page-transition-enter-to {
    opacity: 1;
    transform: translateX(0);
}

.page-transition-leave-from {
    opacity: 1;
    transform: translateX(0);
}

.page-transition-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

@media (max-width: 767px) {
    .layout__sidebar {
        display: none;
    }

    .layout__container {
        width: 100%;
    }

    .layout__main {
        padding: 16px;
    }
}

:deep(.layout__drawer) {
    .el-drawer__body {
        padding: 0;
    }

    @media (max-width: 767px) {
        .el-drawer {
            width: 240px !important;
            max-width: 80vw;
        }
    }
}
</style>
