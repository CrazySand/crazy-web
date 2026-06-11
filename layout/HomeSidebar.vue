<script setup>
import { ref, computed, watch, nextTick } from "vue"
import { useAuthStore } from "@/stores"

const authStore = useAuthStore()

// 接收 props：是否强制展开（用于移动端 Drawer）
const props = defineProps({
    forceExpand: {
        type: Boolean,
        default: false
    }
})

const isCollapse = ref(false)
const isCollapsing = ref(false)

// 计算属性：实际是否折叠（如果强制展开，则始终为 false）
const actualCollapse = computed(() => {
    return props.forceExpand ? false : isCollapse.value
})

// 当 forceExpand 变为 true 时，确保菜单展开并重置所有状态
watch(() => props.forceExpand, async (newVal) => {
    if (newVal) {
        // 立即重置状态
        isCollapse.value = false
        isCollapsing.value = false
        // 等待 DOM 更新，确保 Element Plus 组件状态同步
        await nextTick()
        // 再次确保状态正确（防止异步问题）
        isCollapse.value = false
        isCollapsing.value = false
    }
}, { immediate: true })

const brandText = 'GTI ERP'
const ANIMATION_DURATION = 400 // 动画总时长(ms)

// 从 store 获取菜单
const menuItems = computed(() => authStore.menus)

const handleToggle = () => {
    if (isCollapse.value) {
        // 展开
        isCollapse.value = false
    } else {
        // 折叠：先播放消失动画，再折叠菜单
        isCollapsing.value = true
        setTimeout(() => {
            isCollapse.value = true
            isCollapsing.value = false
        }, ANIMATION_DURATION)
    }
}
</script>

<template>
    <div class="home-sidebar">
        <router-link to="/dashboard">
            <div class="home-sidebar__brand">
                <img src="@/assets/layout/waterdrop.svg" alt="" draggable="false" />
                <span class="home-sidebar__brand-text u-unselectable" :class="{ 'is-collapsing': isCollapsing }"
                    v-show="!actualCollapse">
                    <span v-for="(char, i) in brandText" :key="i" :style="{
                        animationDelay: isCollapsing
                            ? `${(brandText.length - 1 - i) * 0.05}s`
                            : `${i * 0.08}s`
                    }">
                        {{ char === ' ' ? '\u00A0' : char }}
                    </span>
                </span>
            </div>
        </router-link>

        <el-scrollbar>
            <!-- 
                :unique-opened="true" 防止折叠子菜单的时候导致主菜单也被折叠
                :default-active="$route.path"> 以当前路由为默认选中项 
                -->
            <el-menu class="home-sidebar__menu u-unselectable" router :unique-opened="true"
                :default-active="$route.path" :collapse="actualCollapse">
                <template v-for="item in menuItems" :key="item.index">
                    <!-- 有子菜单的项 -->
                    <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.index">
                        <template #title>
                            <el-icon>
                                <component :is="item.icon" />
                            </el-icon>
                            <span class="home-sidebar__menu-text" :class="{ 'is-collapsing': isCollapsing }"
                                style="width: 132px;">
                                <span v-for="(char, i) in item.label" :key="i" :style="{
                                    animationDelay: isCollapsing
                                        ? `${(item.label.length - 1 - i) * 0.05}s`
                                        : `${i * 0.08}s`
                                }">
                                    {{ char }}
                                </span>
                            </span>
                        </template>
                        <el-menu-item v-for="child in item.children" :key="child.index" :index="child.index">
                            <span class="home-sidebar__menu-text" :class="{ 'is-collapsing': isCollapsing }">
                                <span v-for="(char, i) in child.label" :key="i" :style="{
                                    animationDelay: isCollapsing
                                        ? `${(child.label.length - 1 - i) * 0.05}s`
                                        : `${i * 0.08}s`
                                }">
                                    {{ char }}
                                </span>
                            </span>
                        </el-menu-item>
                    </el-sub-menu>
                    <!-- 普通菜单项 -->
                    <el-menu-item v-else :index="item.index">
                        <el-icon>
                            <component :is="item.icon" />
                        </el-icon>
                        <span class="home-sidebar__menu-text" :class="{ 'is-collapsing': isCollapsing }"
                            style="width: 132px;">
                            <span v-for="(char, i) in item.label" :key="i" :style="{
                                animationDelay: isCollapsing
                                    ? `${(item.label.length - 1 - i) * 0.05}s`
                                    : `${i * 0.08}s`
                            }">
                                {{ char }}
                            </span>
                        </span>
                    </el-menu-item>
                </template>
            </el-menu>
        </el-scrollbar>

        <!-- 折叠按钮：在强制展开模式下隐藏 -->
        <el-button 
            v-if="!forceExpand" 
            class="home-sidebar__toggle-btn" 
            @click="handleToggle" 
            text
        >
            <el-tooltip :content="isCollapse ? '点击展开' : '点击折叠'" placement="right" effect="light">
                <img class="home-sidebar__toggle-btn-icon" src="@/assets/layout/sidebar/menu_collasped-right.svg"
                    v-if="isCollapse">
                <img class="home-sidebar__toggle-btn-icon" src="@/assets/layout/sidebar/menu_collasped-left.svg" v-else>
            </el-tooltip>
        </el-button>

    </div>

</template>

<style scoped>
/* ==================== 布局结构 ==================== */

/**
 * 侧边栏容器
 * - Flex 垂直布局：品牌区 + 菜单滚动区 + 折叠按钮
 * - width: 100% 宽度由父容器控制
 * - border-right: 右侧分隔线
 */
.home-sidebar {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    border-right: 1px solid #ededed;
}

/**
 * 品牌区域（Logo + 公司名称）
 * - gap: 10px Logo 和文字间距
 * - height: 48px 与头部高度一致
 */
.home-sidebar__brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-left: 16px;
    height: 48px;
    font-size: 18px;
    font-weight: bold;
}

/**
 * 品牌文字动画：展开打字效果，折叠跳动效果
 */
.home-sidebar__brand-text span {
    display: inline-block;
    opacity: 0;
    animation: typing-in 0.3s ease forwards;
}

.home-sidebar__brand-text.is-collapsing span {
    opacity: 1;
    animation: bounce-out 0.3s ease forwards;
}

/**
 * 菜单文字动画：展开打字效果，折叠跳动效果
 */
.home-sidebar__menu-text span {
    display: inline-block;
    opacity: 0;
    animation: typing-in 0.3s ease forwards;
}

.home-sidebar__menu-text.is-collapsing span {
    opacity: 1;
    animation: bounce-out 0.3s ease forwards;
}

/**
 * 打字效果：字符从左到右逐个出现，带有打字机的顿感
 */
@keyframes typing-in {
    0% {
        opacity: 0;
        transform: translateX(-5px) scale(0.8);
    }

    50% {
        opacity: 1;
        transform: translateX(0) scale(1.1);
    }

    100% {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

/**
 * 跳动消失效果：字符向上跳动后消失
 */
@keyframes bounce-out {
    0% {
        opacity: 1;
        transform: translateY(0);
    }

    40% {
        opacity: 1;
        transform: translateY(-8px);
    }

    100% {
        opacity: 0;
        transform: translateY(5px);
    }
}

/* ==================== 菜单滚动区 ==================== */

/**
 * 滚动容器
 * - flex: 1 占据剩余空间
 */
.el-scrollbar {
    flex: 1;
}

/**
 * 滚动区顶部间距
 */
.el-scrollbar::before {
    content: '';
    display: block;
    height: 10px;
}

/**
 * 菜单背景色
 */
.home-sidebar__menu {
    background: #fff;
}

/* ==================== 折叠按钮 ==================== */

/**
 * 折叠切换按钮
 * - justify-content: flex-start 图标靠左对齐
 */
.home-sidebar__toggle-btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    padding-left: 24px;
}

/**
 * 折叠按钮图标
 */
.home-sidebar__toggle-btn-icon {
    width: 16px;
    color: #666;
}

.el-tooltip .el-icon {
    margin-right: 8px;
}

/* ==================== Element Plus 样式覆盖 ==================== */

/**
 * 移除菜单右侧边框
 */
:deep(.el-menu) {
    border-right: none !important;
}

/**
 * 菜单项样式
 * - margin: 4px 8px 左右留白
 * - border-radius: 4px 圆角
 */
:deep(.el-menu-item) {
    padding-left: 12px !important;
    margin: 4px 8px;
    height: 42px;
    border-radius: 4px;
    color: #666;
}

/**
 * 子菜单项缩进
 */
:deep(.el-menu--inline > .el-menu-item) {
    padding-left: 42px !important;
}

/**
 * 菜单项 hover 状态
 */
:deep(.el-menu-item:hover) {
    color: #000;
    background: inherit;
}

/**
 * 菜单项选中状态
 */
:deep(.el-menu-item.is-active) {
    color: #fff;
    background: #409eff;
}

/**
 * 子菜单标题 hover 状态
 */
:deep(.el-sub-menu__title:hover) {
    background: none;
    color: #000;
}

/**
 * 子菜单标题样式
 */
:deep(.el-sub-menu__title) {
    height: 42px;
    color: #666;
}
</style>