<template>
  <header
    class="sticky top-0 z-10 w-full mx-auto px-4 flex h-16 justify-between items-center bg-background">
    <button
      class="flex justify-center items-center gap-2 cursor-pointer"
      @click="$router.push('/')">
      <Logo
        class="text-background-content"
        :style="{
          fill: themeStore.darkTheme ? 'rgba(255, 255, 255, 0.9)' : '#666666',
        }" />
      <div class="text-md text-background-content font-bold">
        {{ $t('other.title-logo') }}
      </div>
    </button>

    <HomeNav
      :menuItems="menuItems"
      :activeNavName="activeNavName"
      :updateNav="updateNav"
      :updatePage="updatePage" />

    <div class="flex gap-4 items-center">
      <LoadingIcon v-if="configStore.loading" />
      <ScButton
        class="relative cursor-pointer"
        :class="{
          'pr-2': messageStore.replyUnread.length > 0,
        }"
        :icon="Mail"
        :iconSize="25"
        noPd
        @click="toMessage">
        <ScTag
          v-if="userStore.isLogin && messageStore.replyUnread.length"
          size="xs"
          status="error"
          class="absolute top-[-4px] right-[-10%]">
          {{
            formatNumberWithLimit(
              messageStore.replyUnread.length + messageStore.likesUnread.length
            )
          }}
        </ScTag>
      </ScButton>
      <ScButton
        :icon="Trophy"
        :iconSize="24"
        noPd
        @click="$router.push({ name: 'mingrentang' })" />
      <ThemeButton />
      <LangPopupButton />
      <ScLogin />
    </div>
  </header>
  <div v-if="show" class="flex justify-center w-full bg-warning/30">
    <span @click="toAnnouncement">{{ postData?.title }}</span>
    <ScButton
      class="ml-4"
      :icon="X"
      @click="offAnnouncement(postData?.id)"
      noPd
      noBg>
    </ScButton>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Logo } from '@/icon'
import type { Post } from '@/types/Post'
import { messageApi, postApi } from '@/apis'
import { Mail, X, Trophy } from 'lucide-vue-next'
import { useAnnouncementStore } from '@/stores/global/announcementStore'
import { useMessageStore } from '@/stores/module/message/MessageStore'
import { useConfigStore } from '@/stores/global/configStore'
import { useThemeStore } from '@/stores/global/themeStore'
import { formatNumberWithLimit } from '@/utils/format'
import ThemeButton from '@/components/common/ThemeButton.vue'
import ScButton from '@/components/common/ScButton.vue'
import ScTag from '@/components/common/ScTag.vue'
import HomeNav from './HomeNav.vue'
import ScLogin from '../../common/ScLogin.vue'
import { usePostStore } from '@/stores/module/post/postStore'
import LoadingIcon from '@/components/common/LoadingIcon.vue'
import { useUserStore } from '@/stores/module/user/userStore'
import { useToast } from 'vue-toastification'
import { getMenuItems } from '@/stores/module/post/service'
import LangPopupButton from '@/components/common/LangPopupButton.vue'

const messageStore = useMessageStore()
const announcementStore = useAnnouncementStore()
const themeStore = useThemeStore()
const configStore = useConfigStore()
const postStore = usePostStore()
const userStore = useUserStore()
const postData = ref<Post | null>(null)
const show = ref(false)
const router = useRouter()
const activeNavName = ref('')
const toast = useToast()
const { t } = useI18n()
const menuItems = getMenuItems(t)

const toMessage = () => {
  if (userStore.isLogin) {
    router.push({ name: 'message' })
  } else {
    toast.info(t('t.qing-xian-deng-lu'))
  }
}

const updateNav = (name: string) => {
  postStore.nav.name = name
  activeNavName.value = name
}
const updatePage = (page: number) => {
  postStore.postPage.page = page
}

const toAnnouncement = () => {
  show.value = false
  if (!postData.value) return
  router.push({
    name: 'postDetails',
    params: {
      postId: postData.value.id,
    },
  })
}

const getAnnouncement = (postList: Post[]): Post | null => {
  const popUpIds = new Set(announcementStore.popUps)
  const diffPost = postList.find((post) => !popUpIds.has(post.id))
  return diffPost ?? null
}

const offAnnouncement = (id?: number) => {
  if (id) {
    announcementStore.popUps.push(id)
    announcementStore.popUps = Array.from(new Set(announcementStore.popUps)) // 去重
  }
  show.value = false
}

onMounted(() => {
  configStore.loading = true
  postApi
    .getPostList({
      top: 2,
    })
    .then((res) => {
      postData.value = getAnnouncement(res.data.data.list)
      if (postData.value) {
        show.value = true
      }
      configStore.loading = false
    })

  messageApi.getUnreadMessageList().then((res) => {
    messageStore.replyUnread = res.data.data.filter(
      (item: any) => item.type === 1
    )
    messageStore.likesUnread = res.data.data.filter(
      (item: any) => item.type === 2
    )
  })
})
</script>
