<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting, UserFilled, SwitchButton, Menu } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores'
import NotificationPanel from '@/components/NotificationPanel.vue'

// 接收父组件传递的 props
const props = defineProps({
    isMobile: {
        type: Boolean,
        default: false
    }
})

// 定义事件
const emit = defineEmits(['open-menu'])

const authStore = useAuthStore()
const router = useRouter()

// 用户头像URL
const userAvatarUrl = computed(() => {
    return authStore.user?.avatar || undefined
})

// 用户头像显示文本（如果没有头像）
const userAvatarText = computed(() => {
    return authStore.user?.nickname?.[0]?.toUpperCase() || authStore.user?.username?.[0]?.toUpperCase() || 'U'
})

// 全屏状态
const isFullScreen = ref(false)

/**
 * 切换全屏模式
 * 兼容不同浏览器的全屏 API
 */
const handleSwitchFullscreen = () => {
    if (!isFullScreen.value) {
        // 进入全屏
        const el = document.documentElement
        if (el.requestFullscreen) {
            el.requestFullscreen()
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen()
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen()
        } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen()
        }
        isFullScreen.value = true
    } else {
        // 退出全屏
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen()
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen()
        }
        isFullScreen.value = false
    }
}

/**
 * 用户设置
 */
const handleUserSettings = () => {
    router.push({ name: 'Profile' })
}

/**
 * 退出登录
 */
const handleLogout = () => {
    authStore.clearAuth()
    router.push({ name: 'Login' })
}

/**
 * 系统设置
 */
const handleSystemSettings = () => {
    ElMessage.info('前方的世界暂未开放，以后再来探索吧！')
}

/**
 * 处理下拉菜单命令
 */
const handleCommand = (command) => {
    const commandMap = {
        userSettings: handleUserSettings,
        logout: handleLogout
    }
    commandMap[command]?.()
}
</script>

<template>
    <div class="header" :class="{ 'is-mobile': isMobile }">
        <!-- 移动端菜单按钮 -->
        <el-button 
            v-if="isMobile" 
            class="header__btn header__menu-btn" 
            text 
            @click="emit('open-menu')"
        >
            <el-icon>
                <Menu />
            </el-icon>
        </el-button>

        <!-- 右侧按钮组 -->
        <div class="header__right" style="height: 100%;">
            <!-- 全屏切换按钮 -->
            <el-button class="header__btn header__fullscreen-btn" text @click="handleSwitchFullscreen">
                <el-icon v-if="!isFullScreen">
                    <FullScreen />
                </el-icon>
                <img v-else class="header__exit-fullscreen-icon" src="@/assets/layout/header/exit-fullscreen.svg" alt="退出全屏" />
            </el-button>

            <!-- 消息通知 -->
            <NotificationPanel />

            <!-- 用户下拉菜单 -->
            <el-dropdown class="header__dropdown" @command="handleCommand" trigger="click">
                <!-- 用户信息：头像 + 昵称 -->
                <div class="header__user-info">
                    <div class="header__avatar-wrapper">
                        <el-avatar class="header__avatar"
                            :src="userAvatarUrl">
                            <span>{{ userAvatarText }}</span>
                        </el-avatar>
                    </div>
                    <span class="header__nickname u-unselectable">
                        {{ authStore.user?.nickname }}
                    </span>
                </div>

                <!-- 下拉菜单项 -->
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="userSettings">
                            <el-icon>
                                <UserFilled />
                            </el-icon>
                            账户设置
                        </el-dropdown-item>
                        <el-dropdown-item command="logout">
                            <el-icon>
                                <SwitchButton />
                            </el-icon>
                            退出系统
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>

            <!-- 系统设置按钮 -->
            <el-button class="header__btn header__settings-btn" text @click="handleSystemSettings">
                <el-icon>
                    <Setting />
                </el-icon>
            </el-button>
        </div>
    </div>
</template>

<style scoped>
/* ==================== 布局结构 ==================== */

/**
 * 头部容器
 * - Flex 布局，子元素靠右排列（桌面端）或两端对齐（移动端）
 * - height: 100% 占满父容器高度
 * - border-bottom: 分隔线
 */
.header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
    border-bottom: 1px solid #ededed;
}

/**
 * 移动端头部布局：菜单按钮在左侧，其他按钮在右侧
 */
.header.is-mobile {
    justify-content: space-between;
}

/**
 * 右侧按钮组容器
 */
.header__right {
    display: flex;
    align-items: center;
}

/* ==================== 按钮样式 ==================== */

/**
 * 通用按钮样式
 * - width: 40px 固定宽度
 * - height: 100% 占满头部高度
 * - border-radius: 0 取消圆角
 */
.header__btn {
    width: 40px;
    height: 100%;
}

/**
 * 按钮图标大小
 */
.header__btn .el-icon {
    font-size: 16px;
}

/**
 * 退出全屏图标
 */
.header__exit-fullscreen-icon {
    width: 16px;
    height: 16px;
}

/**
 * 移动端菜单按钮
 * - 仅在移动端显示
 */
.header__menu-btn {
    order: -1;
}

/* ==================== 用户信息区域 ==================== */

/**
 * 下拉菜单容器
 * - height: 100% 占满头部高度
 */
.header__dropdown {
    height: 100%;
}

/**
 * 用户信息容器（头像 + 昵称）
 * - gap: 6px 头像和昵称间距
 * - padding: 0 10px 左右内边距
 * - cursor: pointer 鼠标悬停显示手型
 * - hover 时背景变灰
 */
.header__user-info {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    height: 100%;
    padding: 0 10px;
    color: #000;
    cursor: pointer;
}

.header__user-info:hover {
    background: #f6f6f6;
}

/**
 * 头像容器（用于定位徽章）
 * - position: relative 为徽章提供定位基准
 */
.header__avatar-wrapper {
    position: relative;
    display: inline-block;
}

/**
 * 用户头像
 * - scale: 0.6 缩小头像尺寸
 */
.header__avatar {
    scale: 0.6;
}

/**
 * 钻石徽章
 * - position: absolute 绝对定位
 * - bottom: -6px 向上偏移一半高度，使徽章一半在头像内一半在头像外
 * - right: -6px 向左偏移一半宽度，使徽章一半在头像内一半在头像外
 * - width: 12px 徽章大小（缩小）
 * - height: 12px 徽章大小（缩小）
 */
.header__badge {
    position: absolute;
    width: 12px;
    bottom: 4px;
    right: 6px;
}

/* ==================== Element Plus 样式覆盖 ==================== */

/**
 * 按钮 hover 背景色
 */
:deep(.el-button.is-text:not(.is-disabled):hover) {
    background-color: #f6f6f6;
}

/**
 * 取消按钮圆角
 */
:deep(.header__btn) {
    border-radius: 0;
}

/* 移除通知按钮的圆角 */
:deep(.notification-btn) {
    border-radius: 0;
}
</style>
