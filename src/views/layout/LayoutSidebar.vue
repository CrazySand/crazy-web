<script setup>
import { computed } from "vue"
import { House, Lock, UserFilled } from "@element-plus/icons-vue"
import collapseIconExpand from "@/assets/images/menu_collasped-right.svg"
import collapseIconCollapse from "@/assets/images/menu_collasped-left.svg"

const props = defineProps({
    collapsed: {
        type: Boolean,
        default: false,
    },
    forceExpand: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(["update:collapsed"])

// 移动端抽屉里强制展开，桌面端跟随父组件 collapsed。
const actualCollapse = computed(() =>
    props.forceExpand ? false : props.collapsed,
)

const brandText = "CRAZY WEB"

const menuItems = [
    { index: "/home", label: "首页", icon: House },
    { index: "/user", label: "用户管理", icon: UserFilled },
    {
        index: "/permission",
        label: "权限管理",
        icon: Lock,
        children: [
            { index: "/permission/role", label: "角色管理" },
            { index: "/permission/menu", label: "菜单管理" },
            { index: "/permission/api", label: "接口权限" },
        ],
    },
]

const handleToggle = () => {
    emit("update:collapsed", !props.collapsed)
}
</script>

<template>
    <div class="layout-sidebar">
        <router-link to="/home">
            <div class="layout-sidebar__brand">
                <img
                    src="@/assets/images/waterdrop.svg"
                    alt=""
                    draggable="false"
                />
                <span
                    v-show="!actualCollapse"
                    class="layout-sidebar__brand-text u-unselectable"
                >
                    {{ brandText }}
                </span>
            </div>
        </router-link>

        <el-scrollbar>
            <el-menu
                class="layout-sidebar__menu u-unselectable"
                router
                :unique-opened="true"
                :default-active="$route.path"
                :collapse="actualCollapse"
                :collapse-transition="false"
            >
                <template v-for="item in menuItems" :key="item.index">
                    <el-sub-menu v-if="item.children" :index="item.index">
                        <template #title>
                            <el-icon>
                                <component :is="item.icon" />
                            </el-icon>
                            <span class="layout-sidebar__menu-text">{{
                                item.label
                            }}</span>
                        </template>

                        <el-menu-item
                            v-for="child in item.children"
                            :key="child.index"
                            :index="child.index"
                        >
                            <span>{{ child.label }}</span>
                        </el-menu-item>
                    </el-sub-menu>

                    <el-menu-item v-else :index="item.index">
                        <el-icon>
                            <component :is="item.icon" />
                        </el-icon>
                        <span class="layout-sidebar__menu-text">{{
                            item.label
                        }}</span>
                    </el-menu-item>
                </template>
            </el-menu>
        </el-scrollbar>

        <el-button
            v-if="!forceExpand"
            class="layout-sidebar__toggle-btn"
            text
            @click="handleToggle"
        >
            <el-tooltip
                :content="collapsed ? '点击展开' : '点击折叠'"
                placement="right"
                effect="light"
            >
                <img
                    class="layout-sidebar__toggle-icon"
                    :src="collapsed ? collapseIconExpand : collapseIconCollapse"
                    alt=""
                />
            </el-tooltip>
        </el-button>
    </div>
</template>

<style scoped>
.layout-sidebar {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    border-right: 1px solid #ededed;
}

/* 与 pure-admin SidebarLogo 对齐：padding-left 10px、logo 32px、标题 margin-left 12px。 */
.layout-sidebar__brand {
    display: flex;
    align-items: center;
    padding-left: 10px;
    height: 48px;
}

.layout-sidebar__brand img {
    display: inline-block;
    height: 32px;
}

.layout-sidebar__brand-text {
    display: inline-block;
    height: 32px;
    margin: 2px 0 0 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 18px;
    font-weight: 600;
    line-height: 32px;
    color: initial;
    white-space: nowrap;
}

.el-scrollbar {
    flex: 1;
}

.layout-sidebar__menu {
    background: #fff;
}

.layout-sidebar__toggle-btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    padding-left: 24px;
}

.layout-sidebar:has(.el-menu--collapse) .layout-sidebar__toggle-btn {
    justify-content: center;
    padding-left: 0;
}

.layout-sidebar__toggle-icon {
    width: 16px;
    color: #666;
}

.el-tooltip .el-icon {
    margin-right: 8px;
}

:deep(.el-menu) {
    border-right: none !important;
}

:deep(.el-menu--collapse) {
    width: 54px;
}

:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title > .el-icon:not(.el-sub-menu__icon-arrow)) {
    margin-right: 5px;
    font-size: 18px;
}

:deep(.el-sub-menu__icon-arrow) {
    margin-right: 0;
    font-size: 12px;
    color: inherit;
}

:deep(.el-menu-item) {
    padding-left: 12px !important;
    margin: 4px 8px;
    height: 42px;
    border-radius: 4px;
    color: #666;
}

:deep(.el-menu--inline > .el-menu-item) {
    padding-left: 42px !important;
}

:deep(.el-menu-item:hover) {
    color: #000;
    background: inherit;
}

:deep(.el-menu-item.is-active) {
    color: #fff;
    background: #409eff;
}

:deep(.el-sub-menu__title:hover) {
    background: none;
    color: #000;
}

:deep(.el-sub-menu__title) {
    height: 42px;
    color: #666;
}

:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
    color: #000 !important;
    font-weight: inherit;
}

/* 折叠态覆盖放末尾，避免被上方通用 menu-item 规则盖掉。 */
:deep(.el-menu--collapse .el-menu-tooltip__trigger) {
    width: 54px;
    padding: 0;
    justify-content: center;
}

:deep(.el-menu--collapse .el-menu-item),
:deep(.el-menu--collapse .el-sub-menu > .el-sub-menu__title) {
    padding: 0 !important;
    margin: 0;
    height: 50px;
    line-height: 50px;
    justify-content: center;
}

:deep(.el-menu--collapse .el-sub-menu) {
    margin: 0;
}

:deep(.el-menu--collapse .el-menu-item .el-icon),
:deep(.el-menu--collapse .el-sub-menu__title > .el-icon:not(.el-sub-menu__icon-arrow)) {
    margin-right: 0;
}

:deep(.el-menu--collapse .el-menu-item) {
    position: relative;
}

:deep(.el-menu--collapse .el-menu-item.is-active) {
    background: transparent;
    color: #fff;
}

:deep(.el-menu--collapse .el-menu-item.is-active::before) {
    position: absolute;
    inset: 0 8px;
    margin: 4px 0;
    content: "";
    background: #409eff;
    border-radius: 3px;
}

:deep(.el-menu--collapse .el-menu-item.is-active > *) {
    position: relative;
    z-index: 1;
}

/* 折叠态：子菜单选中时父级用左侧蓝色竖条，不用蓝色背景块。 */
:deep(.el-menu--collapse .el-sub-menu > .el-sub-menu__title) {
    position: relative;
}

:deep(.el-menu--collapse .el-sub-menu > .el-sub-menu__title::before) {
    position: absolute;
    top: 50%;
    left: 0;
    width: 2px;
    height: 0;
    content: "";
    transform: translateY(-50%);
    transition: height 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

:deep(.el-menu--collapse .el-sub-menu.is-active > .el-sub-menu__title) {
    background: transparent;
    color: #000 !important;
}

:deep(.el-menu--collapse .el-sub-menu.is-active > .el-sub-menu__title::before) {
    top: 0;
    height: 100%;
    background-color: #409eff;
    transform: none;
}
</style>
