<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const breadcrumbList = computed(() => {
    return route.matched.filter(item => item.meta?.title)
})

const parentBreadcrumbList = computed(() => {
    return breadcrumbList.value.slice(0, -1)
})

const currentBreadcrumb = computed(() => {
    return breadcrumbList.value.at(-1)
})

const handleLink = (item, index) => {
    if (index === breadcrumbList.value.length - 1) return

    if (item.redirect) {
        router.push(item.redirect)
        return
    }

    router.push({ name: item.name })
}
</script>

<template>
    <el-breadcrumb class="layout-breadcrumb u-unselectable" separator="/">
        <el-breadcrumb-item
            v-for="(item, index) in parentBreadcrumbList"
            :key="item.path"
        >
            <a @click.prevent="handleLink(item, index)">
                {{ item.meta.title }}
            </a>
        </el-breadcrumb-item>

        <el-breadcrumb-item v-if="currentBreadcrumb">
            <a @click.prevent>
                <span class="layout-breadcrumb__current">
                    <transition name="breadcrumb-current">
                        <span
                            :key="currentBreadcrumb.path"
                            class="layout-breadcrumb__current-text"
                        >
                            {{ currentBreadcrumb.meta.title }}
                        </span>
                    </transition>
                </span>
            </a>
        </el-breadcrumb-item>
    </el-breadcrumb>
</template>

<style scoped>
.layout-breadcrumb {
    line-height: 48px;
}

.layout-breadcrumb__current {
    position: relative;
    display: inline-block;
    min-width: 4em;
    height: 48px;
    line-height: 48px;
    vertical-align: top;
}

.layout-breadcrumb__current-text {
    display: inline-block;
    white-space: nowrap;
}

:deep(.el-breadcrumb__inner a) {
    font-weight: 400;
    color: #000000d9;
}

:deep(.el-breadcrumb__inner a:hover) {
    color: var(--el-color-primary);
}

.breadcrumb-current-enter-active {
    transition: all 0.4s;
}

.breadcrumb-current-leave-active {
    position: absolute;
    top: 0;
    left: 0;
    transition: all 0.3s;
}

.breadcrumb-current-enter-from,
.breadcrumb-current-leave-to {
    opacity: 0;
    transform: translateX(20px);
}
</style>
