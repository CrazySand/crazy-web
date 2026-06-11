<script setup>
import { onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { ElMessage, ElNotification } from "element-plus"
import { User, Lock, Key, QuestionFilled } from "@element-plus/icons-vue"
import { animate, stagger, spring } from "animejs"
import { login } from "@/api/auth"
import { useAuthStore } from "@/stores"
import { API_CODE } from "@/utils/request"

const router = useRouter()
const authStore = useAuthStore()

// 占位验证码（base64 SVG，仅显示「MOCK」文字），后端联调后由接口替换。
const MOCK_CAPTCHA_DATA_URL =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMzYiPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMzYiIGZpbGw9IiNmNGY0ZjQiLz48dGV4dCB4PSI2MCIgeT0iMjQiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMzMzMiPk1PQ0s8L3RleHQ+PC9zdmc+"

// 入场动画配置
const FADE_IN_CONFIG = {
    translateY: [
        { to: 60, duration: 0 },
        { to: 0, ease: spring({ stiffness: 400, damping: 10 }), duration: 300 },
    ],
    opacity: [
        { to: 0, duration: 0 },
        { to: 1, duration: 300 },
    ],
    delay: stagger(20),
}

const loginForm = reactive({
    username: "",
    password: "",
    captcha: "",
    rememberMe: false,
})

const loginRules = {
    username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
    password: [{ required: true, message: "请输入密码", trigger: "blur" }],
    captcha: [{ required: true, message: "请输入验证码", trigger: "blur" }],
}

const loginFormRef = ref(null)
const loginLoading = ref(false)
const captchaImage = ref("")

const refreshCaptcha = () => {
    captchaImage.value = MOCK_CAPTCHA_DATA_URL
}

const showWelcomeNotification = () => {
    ElNotification({
        message: "世界灿烂盛大，欢迎回家！",
        type: "primary",
        position: "top-right",
    })
}

const handleLogin = async () => {
    const valid = await loginFormRef.value?.validate().catch(() => false)
    if (!valid) return

    loginLoading.value = true
    try {
        // const res = await login({
        //     username: loginForm.username,
        //     password: loginForm.password,
        // })
        // if (res.code === API_CODE.OK) {
        //     authStore.setAuth({
        //         token: res.data.access_token,
        //         user: { nickname: res.data.nickname },
        //         rememberMe: loginForm.rememberMe,
        //     })
        //     ElMessage.success(res.msg)
        //     router.replace("/")
        //     return
        // }
        // ElMessage.error(res.msg)
        authStore.setAuth({
            token: "mock-token",
            user: { nickname: "黎明轩", avatar: null },
            rememberMe: loginForm.rememberMe,
        })
        await router.replace("/")
        showWelcomeNotification()
    } finally {
        loginLoading.value = false
    }
}

const handleForgetPassword = () => {
    ElMessage.info("请联系管理员重置密码")
}

onMounted(() => {
    refreshCaptcha()
    animate(".animate-fade-in", FADE_IN_CONFIG)
})
</script>

<template>
    <div class="login u-unselectable">
        <!-- 登录页背景层：作为 login 模块内部的装饰元素。 -->
        <img
            class="login__background"
            src="@/assets/login/background.png"
            alt=""
        />

        <!-- 左侧：装饰插图 -->
        <div class="login__illustration">
            <img
                src="@/assets/login/illustration.svg"
                alt=""
                draggable="false"
            />
        </div>

        <!-- 右侧：登录表单 -->
        <div class="login__panel">
            <div class="login__form-wrap">
                <!-- Logo -->
                <div class="login__logo animate-fade-in">
                    <img
                        src="@/assets/login/waterdrop.svg"
                        alt=""
                        draggable="false"
                    />
                </div>

                <!-- 登录表单：支持回车提交 -->
                <el-form
                    :model="loginForm"
                    :rules="loginRules"
                    ref="loginFormRef"
                    @keydown.enter="handleLogin"
                >
                    <el-form-item prop="username" class="animate-fade-in">
                        <el-input
                            v-model="loginForm.username"
                            :prefix-icon="User"
                            placeholder="用户名"
                            clearable
                        />
                    </el-form-item>

                    <el-form-item prop="password" class="animate-fade-in">
                        <el-input
                            v-model="loginForm.password"
                            :prefix-icon="Lock"
                            placeholder="密码"
                            show-password
                            clearable
                        />
                    </el-form-item>

                    <el-form-item prop="captcha" class="animate-fade-in">
                        <el-input
                            v-model="loginForm.captcha"
                            :prefix-icon="Key"
                            placeholder="验证码"
                            clearable
                        >
                            <!-- 右侧验证码图片，点击刷新 -->
                            <template #append>
                                <img
                                    :src="captchaImage"
                                    alt="验证码"
                                    class="login__captcha-img"
                                    draggable="false"
                                    @click="refreshCaptcha"
                                />
                            </template>
                        </el-input>
                    </el-form-item>

                    <div class="login__options animate-fade-in">
                        <div class="login__remember">
                            <el-checkbox v-model="loginForm.rememberMe"
                                >7 天内免登录</el-checkbox
                            >
                            <el-tooltip
                                content="不勾选时仅当前会话有效"
                                placement="top"
                            >
                                <el-icon class="login__help-icon">
                                    <QuestionFilled />
                                </el-icon>
                            </el-tooltip>
                        </div>
                        <el-button
                            type="primary"
                            link
                            @click="handleForgetPassword"
                            >忘记密码?</el-button
                        >
                    </div>

                    <el-form-item class="animate-fade-in">
                        <el-button
                            class="login__submit"
                            type="primary"
                            :loading="loginLoading"
                            @click="handleLogin"
                            >登录</el-button
                        >
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 布局相关 */
.login {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16vw;
    height: 100vh;
    padding: 0 32px;
    overflow: hidden;
}

/* 入场动画初始态，避免 onMounted 执行前闪现。 */
.animate-fade-in {
    opacity: 0;
    transform: translateY(60px);
}

.login__background {
    position: fixed;
    z-index: -1;
    bottom: 0;
    left: 0;
    width: 80%;
    height: 100%;
}

/* 组件结构 */
.login__illustration {
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.login__panel {
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.login__form-wrap {
    flex: 1;
    min-width: 290px;
    max-width: 360px;
}

.login__logo {
    display: flex;
    justify-content: center;
    align-items: center;
}

.login__logo img {
    height: 80px;
    margin-bottom: 20px;
    scale: 1.2;
}

/* 表单元素 */
.login__options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    font-size: 14px;
}

.login__captcha-img {
    cursor: pointer;
    width: 120px;
    height: 36px;
}

.login__remember {
    display: flex;
    align-items: center;
}

.login__help-icon {
    margin-left: 4px;
    color: #909399;
    cursor: pointer;
}

.login__help-icon:hover {
    color: #606266;
}

/* 响应式适配 */
@media (max-width: 992px) {
    .login__background {
        display: none;
    }

    .login {
        grid-template-columns: 1fr;
        gap: 0;
        padding: 0;
    }

    .login__illustration {
        display: none;
    }

    .login__panel {
        justify-content: center;
        width: 100vw;
    }
}

/* Element Plus 覆盖 */
:deep(.el-input) {
    height: 38px;
}

:deep(.login__submit) {
    margin-top: 16px;
    width: 100%;
}

:deep(.el-input-group__append) {
    padding: 0;
}
</style>
