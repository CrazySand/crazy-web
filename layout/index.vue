<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import HomeHeader from './HomeHeader.vue'
import HomeSidebar from './HomeSidebar.vue'

// 移动端菜单抽屉显示状态
const drawerVisible = ref(false)
// 抽屉打开计数器，用于强制重新渲染组件
const drawerKey = ref(0)

// 是否为移动端（断点：768px）
const isMobile = ref(false)

// 检测是否为移动端
const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
}

// 打开抽屉
const openDrawer = () => {
    // 每次打开时增加计数器，强制重新渲染组件
    drawerKey.value++
    drawerVisible.value = true
}

// 关闭抽屉
const closeDrawer = () => {
    drawerVisible.value = false
}

// 处理抽屉打开事件
const handleDrawerOpen = () => {
    // 抽屉打开时，确保状态正确
    // 通过 key 属性强制重新渲染组件，状态会自动重置
}

// 监听窗口大小变化
onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
})

// 暴露方法给子组件
defineExpose({
    openDrawer
})
</script>

<template>
    <!-- 主布局容器：侧边栏 + 内容区 -->
    <div class="layout">
        <!-- 侧边栏（桌面端显示） -->
        <div class="layout__sidebar" v-if="!isMobile">
            <HomeSidebar />
        </div>

        <!-- 内容区：头部 + 主内容 -->
        <div class="layout__container">
            <!-- 头部导航栏 -->
            <div class="layout__header">
                <HomeHeader :is-mobile="isMobile" @open-menu="openDrawer" />
            </div>

            <!-- 主内容区（带滚动） -->
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

        <!-- 移动端菜单抽屉 -->
        <el-drawer
            v-model="drawerVisible"
            title="菜单"
            :with-header="false"
            direction="ltr"
            size="200px"
            :modal="true"
            :close-on-click-modal="true"
            :close-on-press-escape="true"
            class="mobile-drawer"
            @open="handleDrawerOpen"
        >
            <!-- 使用 key 确保每次打开时重新渲染组件，避免状态残留 -->
            <HomeSidebar :key="`drawer-${drawerKey}`" :force-expand="true" />
        </el-drawer>
    </div>
</template>

<style scoped>
/* ==================== 布局结构 ==================== */

/**
 * 主布局容器
 * - 使用 Flex 布局实现侧边栏 + 内容区的水平排列
 * - height: 100vh 占满整个视口高度
 * - overflow: hidden 防止出现滚动条（滚动由内部 el-scrollbar 控制）
 */
.layout {
    display: flex;
    height: 100vh;
}

/**
 * 内容区容器
 * - flex: 1 占据剩余空间
 * - min-width: 0 允许 flex 子元素收缩到小于内容宽度（关键！）
 * - 垂直布局：头部固定 + 主内容可滚动
 * - background: #f0f2f5 浅灰色背景，与白色内容区形成对比
 */
.layout__container {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: #f0f2f5;
}

/* ==================== 组件区域 ==================== */

/**
 * 头部导航栏
 * - height: 48px 固定高度
 * - background: #fff 白色背景
 */
.layout__header {
    height: 48px;
    background: #fff;
}

/**
 * 滚动容器
 * - flex: 1 占据剩余空间
 * - min-width: 0 / min-height: 0 允许收缩，确保滚动条正常工作
 * - 内部内容超出时显示滚动条
 */
.layout__scrollbar {
    flex: 1;
    min-width: 0;
    min-height: 0;
}

/**
 * 主内容区
 * - padding: 24px 内容与边缘保持间距（使用 padding 确保滚动时右侧间距保留）
 * - min-width: fit-content 允许内容超出容器宽度，触发横向滚动
 */
.layout__main {
    padding: 24px;
    min-width: fit-content;
}

/* ==================== 页面切换动画 ==================== */

/**
 * 页面切换过渡效果
 * - 使用自定义贝塞尔曲线实现平滑过渡
 * - 持续时间 0.4s
 */
.page-transition-enter-active,
.page-transition-leave-active {
    transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
}

/**
 * 进入动画：从左侧淡入
 * - 初始状态：透明 + 向左偏移 30px
 */
.page-transition-enter-from {
    opacity: 0;
    transform: translateX(-30px);
}

/**
 * 进入动画：完成状态
 * - 最终状态：不透明 + 无偏移
 */
.page-transition-enter-to {
    opacity: 1;
    transform: translateX(0);
}

/**
 * 离开动画：向右侧淡出
 * - 初始状态：不透明 + 无偏移
 */
.page-transition-leave-from {
    opacity: 1;
    transform: translateX(0);
}

/**
 * 离开动画：完成状态
 * - 最终状态：透明 + 向右偏移 30px
 */
.page-transition-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

/* ==================== 移动端响应式 ==================== */

/**
 * 移动端样式（屏幕宽度 < 768px）
 */
@media (max-width: 767px) {
    /**
     * 移动端侧边栏隐藏
     */
    .layout__sidebar {
        display: none;
    }

    /**
     * 移动端主内容区占满全屏
     */
    .layout__container {
        width: 100%;
    }

    /**
     * 移动端主内容区 padding 减小
     */
    .layout__main {
        padding: 16px;
    }
}

/**
 * 移动端抽屉样式
 */
:deep(.mobile-drawer) {
    .el-drawer__body {
        padding: 0;
    }
    
    /* 移动端抽屉宽度优化 */
    @media (max-width: 767px) {
        .el-drawer {
            width: 240px !important;
            max-width: 80vw;
        }
    }
}
</style>
