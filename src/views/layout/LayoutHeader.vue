<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting, UserFilled, SwitchButton, Menu, FullScreen } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores'
import LayoutBreadcrumb from './LayoutBreadcrumb.vue'
import NotificationPanel from '@/components/NotificationPanel.vue'

defineProps({
    isMobile: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['open-menu'])

const authStore = useAuthStore()
const router = useRouter()

const userAvatarUrl = computed(() => authStore.user?.avatar || undefined)

const userAvatarText = computed(() => {
    return authStore.user?.nickname?.[0]?.toUpperCase() || 'U'
})

const isFullScreen = ref(false)

const handleSwitchFullscreen = () => {
    if (!isFullScreen.value) {
        document.documentElement.requestFullscreen?.()
        isFullScreen.value = true
        return
    }

    document.exitFullscreen?.()
    isFullScreen.value = false
}

const handleLogout = () => {
    authStore.clearAuth()
    router.replace({ name: 'Login' })
}

const handleFeatureNotOpen = () => {
    ElMessage.info('前方的世界暂未开放，以后再来探索吧！')
}
</script>

<template>
    <div class="layout-header" :class="{ 'is-mobile': isMobile }">
        <el-button
            v-if="isMobile"
            class="layout-header__btn layout-header__menu-btn"
            text
            @click="emit('open-menu')"
        >
            <el-icon>
                <Menu />
            </el-icon>
        </el-button>

        <LayoutBreadcrumb v-if="!isMobile" class="layout-header__breadcrumb" />

        <div class="layout-header__actions">
            <el-button class="layout-header__btn" text @click="handleSwitchFullscreen">
                <el-icon v-if="!isFullScreen">
                    <FullScreen />
                </el-icon>
                <img
                    v-else
                    class="layout-header__exit-fullscreen-icon"
                    src="@/assets/layout/header/exit-fullscreen.svg"
                    alt="退出全屏"
                />
            </el-button>

            <NotificationPanel />

            <el-dropdown class="layout-header__dropdown" trigger="click">
                <div class="layout-header__user-info">
                    <div class="layout-header__avatar-wrapper">
                        <el-avatar class="layout-header__avatar" :src="userAvatarUrl">
                            <span>{{ userAvatarText }}</span>
                        </el-avatar>
                    </div>
                    <span class="u-unselectable">
                        {{ authStore.user?.nickname }}
                    </span>
                </div>

                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="handleFeatureNotOpen">
                            <el-icon>
                                <UserFilled />
                            </el-icon>
                            账户设置
                        </el-dropdown-item>
                        <el-dropdown-item @click="handleLogout">
                            <el-icon>
                                <SwitchButton />
                            </el-icon>
                            退出系统
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>

            <el-button class="layout-header__btn" text @click="handleFeatureNotOpen">
                <el-icon>
                    <Setting />
                </el-icon>
            </el-button>
        </div>
    </div>
</template>

<style scoped>
.layout-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    border-bottom: 1px solid #ededed;
}

.layout-header.is-mobile {
    justify-content: space-between;
}

.layout-header__actions {
    display: flex;
    align-items: center;
    height: 100%;
}

.layout-header__breadcrumb {
    margin-left: 16px;
}

.layout-header__btn {
    width: 40px;
    height: 100%;
}

.layout-header__btn .el-icon {
    font-size: 16px;
}

.layout-header__exit-fullscreen-icon {
    width: 16px;
    height: 16px;
}

.layout-header__menu-btn {
    order: -1;
}

.layout-header__dropdown {
    height: 100%;
}

.layout-header__user-info {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    height: 100%;
    padding: 0 10px;
    color: #000;
    cursor: pointer;
}

.layout-header__user-info:hover {
    background: #f6f6f6;
}

.layout-header__avatar-wrapper {
    position: relative;
    display: inline-block;
}

.layout-header__avatar {
    scale: 0.6;
}

:deep(.el-button.is-text:not(.is-disabled):hover) {
    background-color: #f6f6f6;
}

:deep(.layout-header__btn) {
    border-radius: 0;
}

:deep(.notification-btn) {
    border-radius: 0;
}
</style>
