<script setup>
import { ElMessage } from 'element-plus'
import { Bell } from '@element-plus/icons-vue'

const handleClick = () => {
    ElMessage.info('前方的世界暂未开放，以后再来探索吧！')
}
</script>

<template>
    <el-button class="notification-btn" text @click="handleClick">
        <el-icon :size="18">
            <Bell />
        </el-icon>
    </el-button>
</template>

<style scoped>
.notification-btn {
    width: 40px;
    height: 100%;
    margin-left: 0;
}
</style>
