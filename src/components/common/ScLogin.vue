<template>
  <!-- Open the modal using ID.showModal() method -->
  <div
    v-if="!userStore.isLogin && deviceStore.device === 2"
    class="flex gap-4 items-center justify-between px-3">
    <ScButton noPadding @click="handleModalChange('login')">
      {{ $t('b.deng-lu') }}
    </ScButton>
    <ScButton noPadding @click="handleModalChange('register')">
      {{ $t('b.zhu-ce') }}
    </ScButton>
  </div>
  <div
    v-if="!userStore.isLogin && deviceStore.device === 1"
    class="flex gap-4 items-center justify-between px-3">
    <ScButton
      noPd
      @click="handleModalChange('login')"
      :icon="CircleUserRound"
      :iconSize="20" />
  </div>
  <div v-else>
    <ScUserCard />
  </div>
  <ScModal v-model="userStore.showLoginModal">
    <Card
      noPg
      :class="{
        'p-4': deviceStore.device === 2,
        'h-[100dvh]  w-screen rounded-none z-4': deviceStore.device === 1,
      }">
      <div class="flex h-full justify-center">
        <!-- 左侧空白 -->
        <!-- <div v-if="deviceStore.device == 2" class="flex-1">
          <img
            src="/public/85120626_p0_master1200.jpg"
            alt="titleImg"
            class="w-full h-full object-cover rounded-lg" />
        </div> -->

        <div
          :class="{
            'flex relative': deviceStore.device === 2,
            ' relative h-[100dvh] flex flex-col justify-center items-center':
              deviceStore.device === 1,
          }">
          <!-- 头部 -->
          <div v-if="deviceStore.device === 1" class="absolute top-12 left-12">
            <ScButton
              noPd
              @click="offModal()"
              :icon="ChevronLeft"
              :iconSize="24"
              class="font-bold text-lg">
              {{ modalMap[modalType] }}
            </ScButton>
          </div>
          <div v-if="deviceStore.device === 2" class="absolute top-0 right-0">
            <ScButton
              noPd
              @click="offModal()"
              :icon="X"
              :iconSize="24"
              class="font-bold text-lg">
            </ScButton>
          </div>

          <!-- 登录 -->
          <div
            v-if="modalType === 'login'"
            class="py-8 mx-4 flex-1 flex flex-col justify-center gap-4"
            :class="{
              'w-[22rem]  px-4': deviceStore.device === 2,
              'w-screen max-w-4xl px-8': deviceStore.device === 1,
            }">
            <div
              v-if="deviceStore.device === 2"
              class="flex justify-between items-end">
              <ScButton noPd :iconSize="24" class="font-bold text-2xl">
                {{ $t('b.deng-lu') }}
              </ScButton>
            </div>

            <form class="flex flex-col" @submit.prevent="handleLogin">
              <div class="w-full mb-4">
                <label class="label py-1">{{ $t('f.zhang-hao') }}</label>
                <ScInput
                  type="text"
                  :placeholder="$t('f.you-xiang-huo-yong-hu-ming')"
                  v-model="loginForm.account" />
              </div>

              <div class="w-full mb-6">
                <label class="label py-1">{{ $t('f.mi-ma') }}</label>
                <ScInput
                  type="password"
                  :placeholder="$t('f.mi-ma')"
                  v-model="loginForm.password" />
              </div>

              <div class="w-full mb-4 flex justify-between items-center">
                <label class="label cursor-pointer">
                  <span class="label-text">{{ $t('f.ji-zhu-wo') }}</span>
                  <input
                    type="checkbox"
                    class="checkbox"
                    checked
                    v-model="note" />
                </label>
              </div>
            </form>

            <div class="modal-action mt-2">
              <!-- <ScButton
                v-if="deviceStore.device === 2"
                Border
                class="px-4"
                @click="offModal">
                {{ $t('b.qu-xiao') }}
              </ScButton> -->

              <ScButton
                Border
                activation
                class="px-4 w-full"
                :loading="buttonLoading"
                :disabled="
                  loginForm.account === '' || loginForm.password === ''
                "
                @click="handleLogin">
                {{ $t('b.deng-lu') }}
              </ScButton>
            </div>
            <hr class="text-gray/50" />
            <div class="w-full flex justify-between">
              <label
                class="label cursor-pointer"
                @click="handleModalChange('reset_password')">
                <span class="label-text text-active">{{
                  $t('f.wang-ji-mi-ma')
                }}</span>
              </label>

              <label
                class="label cursor-pointer"
                @click="handleModalChange('register')">
                <span class="label-text text-active">
                  {{ $t('f.qu-zhu-ce') }}
                </span>
              </label>
            </div>
          </div>

          <!-- 注册 -->
          <div
            v-if="modalType === 'register'"
            class="py-8 mx-4 flex-1 flex flex-col justify-center gap-4"
            :class="{
              'w-[22rem]  px-4': deviceStore.device === 2,
              'w-screen max-w-4xl px-8': deviceStore.device === 1,
            }">
            <div
              v-if="deviceStore.device === 2"
              class="flex justify-between items-end">
              <ScButton noPd :iconSize="24" class="font-bold text-2xl">
                {{ $t('b.zhu-ce') }}
              </ScButton>
              <!-- <div class="label">
                <span> {{ $t('f.yi-jing-you-zhang-hao') }} </span>
                <span
                  class="text-active cursor-pointer"
                  @click="handleModalChange('login')">
                  {{ $t('f.fan-hui-deng-lu') }}
                </span>
              </div> -->
            </div>

            <form class="flex flex-col" @submit.prevent="handleRregister">
              <div class="w-full mb-4">
                <label class="label py-1">{{ $t('f.yong-hu-ming') }}</label>
                <label class="label pl-2">{{ $t('f.yong-yu-deng-lu') }}</label>
                <ScInput
                  type="text"
                  :placeholder="$t('f.qing-shu-ru-yong-hu-ming')"
                  v-model="registerForm.account" />
              </div>

              <div class="w-full mb-4">
                <label class="label py-1">{{ $t('f.you-xiang') }}</label>
                <label class="label pl-2">{{
                  $t('f.yong-yu-deng-lu-he-jie-shou-yan-zheng-ma')
                }}</label>
                <ScInput
                  type="email"
                  :placeholder="$t('d.qing-shu-ru-you-xiang')"
                  v-model="registerForm.email" />
              </div>

              <div class="w-full mb-6">
                <label class="label py-1">{{ $t('f.mi-ma') }}</label>
                <ScInput
                  type="password"
                  :placeholder="$t('d.qing-shu-ru-mi-ma')"
                  v-model="registerForm.password" />
              </div>

              <div class="w-full mb-6">
                <label class="label py-1">{{ $t('f.yan-zheng-ma') }}</label>
                <div class="flex gap-2 items-center">
                  <ScInput
                    type="text"
                    :placeholder="$t('f.qing-shu-ru-you-xiang-yan-zheng-ma')"
                    v-model="registerForm.captcha" />

                  <ScButton
                    Border
                    class="w-34"
                    :disabled="isSendCode"
                    @click="getCaptcha(registerForm.email)"
                    type="button">
                    {{ sendCodeText }}
                  </ScButton>
                </div>
              </div>
            </form>

            <ScButton
              Border
              activation
              class="px-4 w-full"
              :loading="buttonLoading"
              :disabled="
                registerForm.account === '' ||
                registerForm.password === '' ||
                registerForm.email === '' ||
                registerForm.captcha === ''
              "
              @click="handleRregister">
              {{ $t('b.zhu-ce') }}
            </ScButton>

            <hr class="text-gray/50" />

            <div class="w-full flex justify-between">
              <label
                class="label cursor-pointer"
                @click="handleModalChange('reset_password')">
                <span class="label-text text-active">{{
                  $t('f.wang-ji-mi-ma')
                }}</span>
              </label>

              <label
                class="label cursor-pointer"
                @click="handleModalChange('login')">
                <span class="label-text text-active">
                  {{ $t('f.fan-hui-deng-lu') }}
                </span>
              </label>
            </div>
          </div>

          <!-- 忘记密码 -->
          <div
            v-if="modalType === 'reset_password'"
            class="py-8 mx-4 flex-1 flex flex-col justify-center gap-4"
            :class="{
              'w-[22rem]  px-4': deviceStore.device === 2,
              'w-screen max-w-4xl px-8': deviceStore.device === 1,
            }">
            <div
              v-if="deviceStore.device === 2"
              class="flex justify-between items-end">
              <ScButton noPd :iconSize="24" class="font-bold text-2xl">
                {{ $t('f.zhong-zhi-mi-ma') }}
              </ScButton>
            </div>

            <form class="flex flex-col" @submit.prevent="handleRregister">
              <div class="w-full mb-4">
                <label class="label py-1">{{ $t('f.you-xiang') }}</label>
                <ScInput
                  type="email"
                  :placeholder="$t('f.you-xiang')"
                  v-model="resetPasswordForm.email" />
              </div>

              <div class="w-full mb-6">
                <label class="label py-1">{{ $t('f.xin-mi-ma') }}</label>
                <ScInput
                  type="password"
                  :placeholder="$t('f.mi-ma')"
                  v-model="resetPasswordForm.password" />
              </div>

              <div class="w-full mb-6">
                <label class="label py-1">{{ $t('f.yan-zheng-ma') }}</label>
                <div class="flex gap-2 items-center">
                  <ScInput
                    type="text"
                    :placeholder="$t('f.qing-shu-ru-you-xiang-yan-zheng-ma')"
                    v-model="resetPasswordForm.captcha" />

                  <ScButton
                    Border
                    class="w-34"
                    :disabled="isSendCode"
                    @click="getCaptcha(resetPasswordForm.email)"
                    type="button">
                    {{ sendCodeText }}
                  </ScButton>
                </div>
              </div>
            </form>

            <ScButton
              Border
              activation
              class="px-4 w-full"
              :loading="buttonLoading"
              :disabled="
                resetPasswordForm.email === '' ||
                resetPasswordForm.password === '' ||
                resetPasswordForm.captcha === ''
              "
              @click="handleReset">
              {{ $t('f.que-ren-zhong-zhi') }}
            </ScButton>

            <hr class="text-gray/50" />
            <div class="w-full flex justify-between">
              <label
                class="label cursor-pointer"
                @click="handleModalChange('register')">
                <span class="label-text text-active"> 返回注册 </span>
              </label>

              <label
                class="label cursor-pointer"
                @click="handleModalChange('login')">
                <span class="label-text text-active">
                  {{ $t('f.fan-hui-deng-lu') }}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </ScModal>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import ScButton from '@/components/common/ScButton.vue'
import Card from '@/components/common/Card.vue'
import { userApi } from '@/apis'
import type { Api, UserType } from '@/types'
import { useUserStore } from '@/stores/module/user/userStore'
import { useToast } from 'vue-toastification'
import ScUserCard from '@/components/common/ScUserCard.vue'
import ScModal from '@/components/common/ScModal.vue'
import ScInput from '@/components/common/ScInput.vue'
import { formatLink } from '@/utils/format'
import { useDeviceStore } from '@/stores/global/deviceStore'
import { ChevronLeft, CircleUserRound, X } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const deviceStore = useDeviceStore()
const buttonLoading = ref(false)
const isSendCode = ref(false)
const sendCodeText = ref(t('f.huo-qu-yan-zheng-ma'))
const note = ref(false)

const toast = useToast()
const router = useRouter()
const userStore = useUserStore()
let routerGuard: (() => void) | null = null

const loginForm = reactive({
  account: '',
  password: '',
})

const registerForm = reactive({
  account: '',
  email: '',
  password: '',
  captcha: '',
  nickname: '',
})

const resetPasswordForm = reactive({
  email: '',
  password: '',
  captcha: '',
})

// 计时x秒
const countdown = (duration: number) => {
  let timer: ReturnType<typeof setInterval>
  let timeLeft = duration

  const updateText = () => {
    if (timeLeft > 0) {
      sendCodeText.value = t('f.timeleft-miao-hou-zhong-fa', [timeLeft])
      timeLeft--
    } else {
      clearInterval(timer)
      sendCodeText.value = t('f.huo-qu-yan-zheng-ma')
      isSendCode.value = false
    }
  }

  timer = setInterval(updateText, 1000)
}
const modalMap: { [key: string]: string } = {
  login: t('b.deng-lu'),
  register: t('b.zhu-ce'),
  reset_password: t('f.zhong-zhi-mi-ma'),
}
const modalType = ref('login') // 'login' or 'register' or 'reset_password'
const handleModalChange = (type: string) => {
  modalType.value = type
  userStore.showLoginModal = true
  // 往前面插入两条虚假记录
  window.history.pushState(null, '#', document.URL)
  window.history.pushState(null, '#', document.URL)

  routerGuard = router.beforeEach((_to, _from, next) => {
    if (userStore.showLoginModal) {
      offModal()
      next(false)
      return
    }
    next(false)
  })
}

const getCaptcha = (email: string) => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    toast.error(t('t.you-xiang-ge-shi-bu-zheng-que'))
    return
  }
  isSendCode.value = true
  countdown(30)
  userApi
    .sendCode({ email })
    .then((res: Api) => {
      if (res.data.code === 200) {
        toast.success(t('t.yan-zheng-ma-yi-fa-song-dao-nin-de-you-xiang'))
      }
    })
    .catch((error) => {
      // 处理获取验证码错误
      toast.error(error.msg)
      countdown(1)
    })
}

const handleLogin = () => {
  buttonLoading.value = true
  userApi
    .login(loginForm)
    .then((res: Api) => {
      if (res.data.code === 200) {
        const user = res.data.data.user as UserType
        user.headImg = formatLink(user.headImg)
        userStore.userInfo = user
        userStore.token = res.data.data.token

        toast.success(t('t.deng-lu-cheng-gong'))
        offModal()
        buttonLoading.value = false

        userStore.account = loginForm.account
        userStore.password = loginForm.password
        userStore.autoLogin = note.value
        userStore.isLogin = true
      }
    })
    .catch((error) => {
      // 处理登录错误
      toast.error(error.msg)
      buttonLoading.value = false
      userStore.account = ''
      userStore.password = ''
      userStore.userInfo = {} as UserType
      userStore.isLogin = false
    })
}

const handleRregister = () => {
  if (registerForm.password.length < 6 || registerForm.password.length > 20) {
    toast.error(t('t.mi-ma-chang-du-wei-620-ge-zi-fu'))
    return
  }
  if (
    registerForm.captcha.length !== 6 ||
    !/^\d+$/.test(registerForm.captcha)
  ) {
    toast.error(t('t.yan-zheng-ma-wei-6-wei-shu-zi'))
    return
  }
  if (registerForm.account.length < 3 || registerForm.account.length > 20) {
    toast.error(t('t.yong-hu-ming-chang-du-wei-320-ge-zi-fu'))
    return
  }
  if (!/^[a-zA-Z0-9_]+$/.test(registerForm.account)) {
    toast.error(
      t('t.yong-hu-ming-zhi-neng-bao-han-zi-mu-shu-zi-he-xia-hua-xian')
    )
    return
  }

  userApi
    .register(registerForm)
    .then((res: Api) => {
      if (res.data.code === 200) {
        toast.success(t('t.zhu-ce-cheng-gong'))
        modalType.value = 'login'
        loginForm.account = registerForm.account
        loginForm.password = registerForm.password
        buttonLoading.value = false
      }
    })
    .catch((error) => {
      console.log(error)

      // 处理注册错误
      toast.error(error.msg)
      buttonLoading.value = false
    })
}

const handleReset = () => {
  if (
    resetPasswordForm.password.length < 6 ||
    resetPasswordForm.password.length > 20
  ) {
    toast.error(t('t.mi-ma-chang-du-wei-620-ge-zi-fu'))
    return
  }
  if (
    resetPasswordForm.captcha.length !== 6 ||
    !/^\d+$/.test(resetPasswordForm.captcha)
  ) {
    toast.error(t('t.yan-zheng-ma-wei-6-wei-shu-zi'))
    return
  }

  userApi
    .updatePassword(resetPasswordForm)
    .then((res: Api) => {
      if (res.data.code === 200) {
        toast.success(t('t.mi-ma-zhong-zhi-cheng-gong'))
        modalType.value = 'login'
        buttonLoading.value = false
      }
    })
    .catch((error) => {
      console.log(error)

      // 处理重置密码错误
      toast.error(error.msg)
      buttonLoading.value = false
    })
}

const offModal = () => {
  userStore.showLoginModal = false
  if (routerGuard) {
    routerGuard() // 移除路由守卫
    routerGuard = null
  }
}

onMounted(() => {
  // 监听键盘esc键，关闭弹窗
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      offModal()
    }
  })
})
</script>
