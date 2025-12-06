<template>
  <div class="h-12 w-full flex justify-between items-center px-4 bg-background">
    <ScButton noPd @click="onMenu" :icon="Menu" :iconSize="20" />
    <HomeNav
      :menuItems="menuItems"
      :activeNavName="activeNavName"
      :updateNav="updateNav"
      :updatePage="updatePage" />
    <ScLogin />
  </div>

  <ScDrawer v-model="leftDrawer" position="left">
    <template v-if="postStore.plate" #default="{ close }">
      <div class="bg-background w-64 h-full p-4">
        <h3 class="text-xl px-2">{{ $t('b.cai-dan') }}</h3>
        <template v-if="postStore.plate">
          <AccordionItem v-model:open="open2" Border>
            <template #title>测试工具箱</template>
            <template #content>
              <div class="flex flex-col">
                <div
                  class="flex gap-4 items-center justify-between py-2"
                  @click="deleteUser">
                  <div>
                    {{ $t('d.shan-chu-deng-lu-xin-xi') }} ({{
                      userStore.isLogin ? '已登录' : '未登录'
                    }})
                  </div>
                  <button><Trash2 /></button>
                </div>
                <div
                  class="flex gap-4 items-center justify-between py-2"
                  @click="deleteAnnouncement">
                  <div>
                    {{ $t('d.shan-chu-gong-gao-yi-du-zhuang-tai') }} ({{
                      announcementStore.popUps.length
                    }}) / ({{ announcementStore.banners.length }})
                  </div>
                  <button><Trash2 /></button>
                </div>
                <div
                  class="flex gap-4 items-center justify-between py-2"
                  @click="deleteDrawer">
                  <div>清空抽屉 ({{ drawerStore.drawers.length }})</div>
                  <button><Trash2 /></button>
                </div>

                <div
                  class="flex gap-4 items-center justify-between py-2"
                  @click="onToast">
                  <div>弹窗</div>
                  <button><Trash2 /></button>
                </div>
              </div>
            </template>
          </AccordionItem>

          <div class="flex flex-col space-y-4 py-2 px-2">
            <div
              v-if="userStore.isLogin"
              class="flex items-center justify-between py-2"
              @click="(close(), $router.push({ name: 'message' }))">
              <div>{{ $t('b.xiao-xi') }}</div>
              <ChevronRight />
            </div>

            <div
              class="flex items-center justify-between py-2"
              @click="(close(), $router.push({ name: 'mingrentang' }))">
              <div>{{ $t('b.ming-ren-tang') }}</div>
              <ChevronRight />
            </div>

            <div class="flex gap-4 items-center justify-between py-2">
              <div>{{ $t('d.zhou-ye-qie-huan') }}</div>
              <ThemeButton />
            </div>
            <div class="flex gap-4 items-center justify-between py-1">
              <div>{{ $t('d.yu-yan-qie-huan') }}</div>
              <ScSelector
                :options="configStore.langs"
                v-model="configStore.lang"
                class="w-32" />
            </div>

            <div
              v-if="
                userStore.isLogin &&
                verifyPermissions([1, 2, 3, 4, 5, 6, 7, 9, 10])
              "
              class="flex items-center justify-between py-2"
              @click="(close(), $router.push({ name: 'mobileAdmin' }))">
              <div>{{ $t('b.hou-tai-guan-li') }}</div>
              <ChevronRight />
            </div>

            <div
              v-if="userStore.isLogin"
              class="flex gap-4 items-center justify-between py-2 text-error"
              @click="(close(), logout($t))">
              <span>{{ $t('b.tui-chu-deng-lu') }}</span>
              <ScButton :icon="LogOut" :iconSize="22" noPd class="text-error" />
            </div>
          </div>
        </template>
      </div>
    </template>
  </ScDrawer>
</template>

<script setup lang="ts">
import ScButton from '@/components/common/ScButton.vue'
import ScDrawer from '@/components/common/ScDrawer.vue'
import AccordionItem from '@/components/common/ScAccordionItem.vue'
import { Menu, LogOut, ChevronRight, Trash2 } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import { usePostStore } from '@/stores/module/post/postStore'
import { getMenuItems, getPlate } from '@/stores/module/post/service'
import HomeNav from '@/components/pc/homeHeader/HomeNav.vue'
import ScLogin from '@/components/common/ScLogin.vue'
import { useToast } from 'vue-toastification'
import type { UserType } from '@/types'
import { useConfigStore } from '@/stores/global/configStore'
import { useUserStore } from '@/stores/module/user/userStore'
import { useAnnouncementStore } from '@/stores/global/announcementStore'
import { useI18n } from 'vue-i18n'
import ThemeButton from '@/components/common/ThemeButton.vue'
import { logout } from '@/stores/module/user/service'
import { verifyPermissions } from '@/utils/verify'
import { useDrawerStore } from '@/stores/global/drawerStore'
import ScSelector from '@/components/common/ScSelector.vue'
import CreatrPostJump from '@/components/common/CreatrPostJump.vue'

const postStore = usePostStore()
const leftDrawer = ref(false)
const activeNavName = ref('')
const open2 = ref(false)

const toast = useToast()
const configStore = useConfigStore()
const userStore = useUserStore()
const announcementStore = useAnnouncementStore()
const drawerStore = useDrawerStore()
const { locale, t } = useI18n()
const menuItems = getMenuItems(t)

const onToast = () => {
  toast.success(
    {
      component: CreatrPostJump,
      listeners: {
        click: () => {},
      },
    },
    {
      timeout: 30000,
      status: 'success',
    }
  )
}

const onMenu = () => {
  leftDrawer.value = true
}

const updateNav = (name: string) => {
  postStore.nav.name = name
  activeNavName.value = name
}
const updatePage = (page: number) => {
  postStore.postPage.page = page
}

const deleteUser = () => {
  userStore.userInfo = {} as UserType
  userStore.isLogin = false
  userStore.token = ''
  toast.success(t('t.yong-hu-huan-cun-yi-qing-chu'))
}
const deleteAnnouncement = () => {
  announcementStore.popUps = []
  announcementStore.banners = []
  toast.success(t('t.gong-gao-yi-du-zhuang-tai-yi-qing-chu'))
}

const deleteDrawer = () => {
  drawerStore.drawers = []
  toast.success('清空抽屉')
}

watch(
  () => configStore.lang,
  () => {
    locale.value = configStore.lang.value // 监听语言变化
  },
  { immediate: true }
)

onMounted(() => {
  // 初始化或获取数据
  getPlate(t)
})
</script>

<style scoped>
input[type='checkbox'] {
  padding: 0;
}
</style>
