<template>
  <div class="h-12 w-full flex justify-between items-center px-4 bg-background">
    <div class="flex gap-4">
      <ScButton
        noPd
        class=""
        :icon="ChevronLeft"
        :iconSize="22"
        @click="$router.back()">
        {{ activation }}
      </ScButton>
      <ScButton
        noPd
        class=""
        :icon="Home"
        :iconSize="22"
        @click="$router.push('/')">
      </ScButton>
    </div>
    <div v-if="!route.query.userId && !userStore.isLogin" class="text-error">
      {{ $t('t.qing-xian-deng-lu') }}
    </div>
    <ScLogin />
  </div>

  <div class="flex flex-col w-full items-center gap-4 py-2 px-2">
    <RouterView></RouterView>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import { ChevronLeft, Home } from 'lucide-vue-next'

import ScButton from '@/components/common/ScButton.vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/module/user/userStore'
import ScLogin from '@/components/common/ScLogin.vue'
import { useDeviceStore } from '@/stores/global/deviceStore'
const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const routeBtns = ref([
  {
    name: t('nav.zhu-ye'),
    path: '/mobile/user/panel',
  },
  {
    name: t('nav.tie-zi'),
    path: '/mobile/user/post',
  },
  {
    name: t('nav.ping-lun'),
    path: '/mobile/user/comment',
  },
  {
    name: t('nav.zi-yuan'),
    path: '/mobile/user/resource',
  },
  {
    name: t('nav.wen-jian'),
    path: '/mobile/user/file',
  },
  {
    name: t('nav.fu-wu-qi'),
    path: '/mobile/user/server',
  },
  {
    name: t('nav.bian-ji-zi-liao'),
    path: '/mobile/user/edit',
  },
  {
    name: t('d.zhang-hao-an-quan'),
    path: '/mobile/user/account-security',
  },
])
const activation = ref(t('nav.zhu-ye'))
const userStore = useUserStore()
const deviceStore = useDeviceStore()
// const isCurrentUser = computed(() => {
//   return !route.query.userId
// })

onMounted(() => {
  if (deviceStore.device == 2) {
    router.push(route.path.replace('/mobile/', '/'))
  }
  const currentBtn = routeBtns.value.find((btn) => btn.path === route.path)
  if (currentBtn) {
    activation.value = currentBtn.name
  }
  if (userStore.isLogin === false && !route.query.userId) {
    userStore.showLoginModal = true
  }
})

watch(
  () => route.path,
  (newPath) => {
    const currentBtn = routeBtns.value.find((btn) => btn.path === newPath)
    if (currentBtn) {
      activation.value = currentBtn.name
    }
  }
)
</script>
