<template>
  <template v-if="userStore.isLogin">
    <ScButton
      :shadow="false"
      size="small"
      @click.stop="togglePopup()"
      hoverable
      class="relative flex items-center justify-center gap-2">
      <template #icon>
        <Avatar
          :src="userStore.userInfo.headImg"
          :alt="userStore.userInfo.nickname" />
      </template>
      <span v-if="deviceStore.device == 2">
        {{ userStore.userInfo.nickname }}
      </span>
      <template #endIcon v-if="deviceStore.device == 2">
        <ChevronUp class="transition-all" :class="{ 'rotate-180': !isOpen }" />
      </template>
    </ScButton>
  </template>

  <div v-if="isOpen" class="absolute z-50" ref="userCard">
    <Card noPg class="overflow-hidden">
      <div
        class="cursor-pointer px-4 py-2 hover:bg-active hover:text-active-content"
        @click="($router.push('/user/panel'), closePopup())">
        {{ $t('b.ge-ren-zhu-ye') }}
      </div>
      <div
        v-if="verifyPermissions([1, 2, 3, 4, 5, 6, 7])"
        class="cursor-pointer px-4 py-2 hover:bg-active hover:text-active-content"
        @click="($router.push('/admin/panel'), closePopup())">
        {{ $t('b.hou-tai-guan-li') }}
      </div>
      <div class="border border-gray/60"></div>
      <div
        class="cursor-pointer text-error px-4 py-2 hover:bg-error hover:text-active-content"
        @click="logout">
        {{ $t('b.deng-chu') }}
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import Card from '@/components/common/Card.vue'
import { ChevronUp } from 'lucide-vue-next'
import type { UserType } from '@/types'
import ScButton from '@/components/common/ScButton.vue'
import Avatar from '@/components/common/Avatar.vue'
import { userApi } from '@/apis'
import { useUserStore } from '@/stores/module/user/userStore'
import { useToast } from 'vue-toastification'
import { verifyPermissions } from '@/utils/verify'
import { useDeviceStore } from '@/stores/global/deviceStore'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const deviceStore = useDeviceStore()
const isOpen = ref(false)
const toast = useToast()

const userStore = useUserStore()
const router = useRouter()

const logout = () => {
  userStore.isLogin = false
  // 这里可以调用登出接口
  userApi
    .logout()
    .then(() => {
      // 清除用户信息
      userStore.token = ''
      userStore.userInfo = {} as UserType
      userStore.autoLogin = false
      toast.success(t('t.deng-chu-cheng-gong'))
      closePopup()
    })
    .catch(() => {
      toast.error(t('t.deng-chu-shi-bai'))
    })
}

const togglePopup = () => {
  if (deviceStore.device == 1) {
    router.push({ name: 'user' })
    closePopup()
    return
  }
  isOpen.value = !isOpen.value
}

const closePopup = () => {
  isOpen.value = false
}

const userCard = ref<HTMLElement | null>(null)
const handleClickOutside = (event: MouseEvent) => {
  if (userCard.value && !userCard.value.contains(event.target as Node)) {
    closePopup()
  }
}
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closePopup()
  }
}

// 监听组件销毁事件，释放预览链接
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

onMounted(() => {
  nextTick(() => {
    document.addEventListener('click', handleClickOutside)
    // 监听键盘esc键，关闭弹窗

    document.addEventListener('keydown', handleEscKey)
  })
})
</script>
