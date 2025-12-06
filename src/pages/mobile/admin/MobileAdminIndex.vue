<template>
  <div
    class="fixed top-0 left-0 z-1 h-12 w-full flex justify-between items-center px-4 bg-background">
    <div class="flex gap-4">
      <ScButton noPd class="" :icon="Menu" :iconSize="22" @click="onMenu">
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
    <div class="flex gap-2 items-center justify-end">
      <ThemeButton />
      <ScLogin v-if="!userStore.isLogin" />
      <PopupBox v-if="userStore.isLogin" position="bottom-left">
        <template #trigger>
          <Avatar
            :src="userStore.userInfo.headImg"
            :alt="userStore.userInfo.nickname"
            :size="30"
            class="border border-gray/40" />
        </template>
        <Card class="w-62 flex justify-center items-center">
          <Avatar
            :src="userStore.userInfo.headImg"
            :alt="userStore.userInfo.nickname"
            :size="46" />
          <div class="font-bold">{{ userStore.userInfo.nickname }}</div>
          <div class="w-full">
            <div class="flex gap-1 w-full justify-center flex-wrap pb-4">
              <ScRole :user="userStore.userInfo" isAll size="sm" />
            </div>
            <ScButton Border class="w-full" @click="toPage('/mobile/user')">
              {{ $t('b.wo-de-zhu-ye') }}
            </ScButton>
          </div>
        </Card>
      </PopupBox>
    </div>
  </div>

  <div class="px-2 mt-12">
    <RouterView></RouterView>
  </div>

  <ScDrawer v-model="isOpen" position="left">
    <template #default="{ close }">
      <div
        class="bg-background overflow-y-auto no-scrollbar w-[60dvw] h-[100dvh] flex flex-col">
        <div class="flex p-4 justify-between items-center">
          <h1 class="text-lg font-bold">{{ $t('b.cai-dan') }}</h1>
          <ChevronLeft />
        </div>
        <div class="border-b border-gray/40"></div>
        <div
          v-for="item in menuItems"
          :key="item.path"
          class="flex w-full items-center gap-2 px-4 py-3"
          @click="(toPage(item.path), close())">
          <component :is="item.icon" :size="20" />
          <span>{{ item.name }}</span>
        </div>
      </div>
    </template>
  </ScDrawer>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import {
  Package,
  Server,
  UserRoundPen,
  FileChartColumn,
  Award,
  LayoutPanelTop,
  GitCommitHorizontal,
  Megaphone,
  Info,
  Home,
  ShieldAlert,
  UserRoundPlus,
  Trophy,
  ChevronLeft,
  Menu,
} from 'lucide-vue-next'

import { verifyPermissions } from '@/utils/verify'
import { useI18n } from 'vue-i18n'
import ScDrawer from '@/components/common/ScDrawer.vue'
import ScButton from '@/components/common/ScButton.vue'
import { useUserStore } from '@/stores/module/user/userStore'
import ScLogin from '@/components/common/ScLogin.vue'
import ScRole from '@/components/common/ScRole.vue'
import PopupBox from '@/components/common/PopupBox.vue'
import Avatar from '@/components/common/Avatar.vue'
import Card from '@/components/common/Card.vue'
import { useDeviceStore } from '@/stores/global/deviceStore'
import ThemeButton from '@/components/common/ThemeButton.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const deviceStore = useDeviceStore()
const activation = ref('')
const release = ref(true)
const isOpen = ref(false)

const onMenu = () => {
  isOpen.value = !isOpen.value
}

const toPage = (path: string) => {
  router.push(path)
  onMenu()
}

const menuItems = [
  {
    icon: Home,
    name: t('b.shou-ye'),
    path: '/mobile/admin/panel',
    role: verifyPermissions([1, 2, 3, 4, 5, 6, 7, 9, 10]),
  },
  {
    icon: UserRoundPen,
    name: t('b.zhang-hao-guan-li'),
    path: '/mobile/admin/account',
    role: verifyPermissions([1, 2, 3]),
  },
  {
    icon: UserRoundPlus,
    name: t('b.zhu-ce'),
    path: '/mobile/admin/reg',
    role: verifyPermissions([1]),
  },
  {
    icon: FileChartColumn,
    name: t('b.tie-zi-guan-li'),
    path: '/mobile/admin/post',
    role: verifyPermissions([1, 2, 9]),
  },
  {
    icon: ShieldAlert,
    name: t('b.ju-bao-shen-he'),
    path: '/mobile/admin/report',
    role: verifyPermissions([1, 2, 7]),
  },
  {
    icon: Package,
    name: t('b.zi-yuan-guan-li'),
    path: '/mobile/admin/resource',
    role: verifyPermissions([1, 2, 5]),
  },
  {
    icon: Server,
    name: t('b.fu-wu-qi-guan-li'),
    path: '/mobile/admin/server',
    role: verifyPermissions([1, 2, 4]),
  },
  {
    icon: Award,
    name: t('b.jiao-se-guan-li'),
    path: '/mobile/admin/role',
    role: verifyPermissions([1, 2]),
  },
  {
    icon: LayoutPanelTop,
    name: t('b.ban-kuai-guan-li'),
    path: '/mobile/admin/plate',
    role: verifyPermissions([1, 2, 5, 9]),
  },
  {
    icon: GitCommitHorizontal,
    name: t('b.you-xi-ban-ben-hao'),
    path: '/mobile/admin/version',
    role: verifyPermissions([1, 2, 3, 10]),
  },
  {
    icon: Megaphone,
    name: t('b.you-xi-gong-gao'),
    path: '/mobile/admin/motd',
    role: verifyPermissions([1, 2, 6]),
  },
  {
    icon: Info,
    name: t('b.hou-tai-ri-zhi'),
    path: '/mobile/admin/info',
    role: verifyPermissions([1, 2]),
  },
  {
    icon: Trophy,
    name: t('b.ming-ren-tang'),
    path: '/mobile/admin/mingrentang',
    role: verifyPermissions([1, 2, 3]),
  },
]

onMounted(() => {
  if (deviceStore.device == 2) {
    router.push(route.path.replace('/mobile/', '/'))
  }
  const currentBtn = menuItems.find((btn) => btn.path === route.path)
  if (currentBtn) {
    activation.value = currentBtn.name
  }
})

watch(
  () => route.path,
  (newPath) => {
    const currentBtn = menuItems.find((btn) => btn.path === newPath)
    if (currentBtn) {
      activation.value = currentBtn.name
      if (!currentBtn.role) {
        release.value = false
      }
    }
  },
  { immediate: true, deep: true }
)
</script>
