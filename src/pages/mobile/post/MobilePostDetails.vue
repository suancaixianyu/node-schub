<template>
  <div class="px-4 h-[100dvh] overflow-y-auto" ref="postContainer">
    <!-- 导航 -->
    <div class="flex justify-between items-center text-sm h-12">
      <ScButton noPd :icon="ChevronLeft" :icon-size="22" @click="goBack">
      </ScButton>
      <PopupBox
        :icon="Menu"
        :icon-size="22"
        position="bottom-left"
        noPd
        className="p-1.5">
        <template #default="{ close }">
          <Card noPg class="p-1 w-26">
            <template v-if="postData">
              <ScButton noBg @click="reportModal = true" class="break-all">
                {{ $t('b.ju-bao') }}
              </ScButton>

              <ScButton
                v-if="postData.author.id == userStore.userInfo.id"
                noBg
                @click="
                  ($router.push({
                    name: 'publishPost',
                    params: { postId: postData?.id },
                  }),
                  close())
                ">
                {{ $t('b.bian-ji') }}
              </ScButton>
              <ScButton
                v-if="postData && verifyPermissions([1, 2, 5])"
                noBg
                :class="{
                  ' text-green': postData.disabled == 1,
                  ' text-error': postData.disabled == 0,
                }"
                @click="adminDeletePost(postData.id, postData.disabled)">
                {{ postData.disabled == 0 ? $t('b.shan-chu') : $t('b.hui-fu') }}
              </ScButton>

              <ScButton
                v-if="postData && verifyPermissions([1, 2, 5])"
                noBg
                class="group"
                :class="{
                  'text-primary': postData.top == 0,
                  'text-warning': postData.top != 0,
                }"
                @click="setTopItem(postData.id, postData.top)">
                {{
                  postData.top == 0
                    ? $t('b.zhi-ding')
                    : $t('b.qu-xiao-zhi-ding')
                }}
              </ScButton>

              <ScButton
                v-if="postData.creatorId == userStore.userInfo.id"
                :class="{
                  'text-error': postData.visible == 1,
                  'text-success': postData.visible == 2,
                }"
                :icon-size="24"
                @click="unpublishItem(postData.id, postData.visible)">
                {{ postData.visible == 1 ? $t('b.xia-jia') : $t('b.fa-bu') }}
              </ScButton>
            </template>
          </Card>
        </template>
      </PopupBox>
    </div>

    <!-- 提示词 -->
    <div v-if="postData?.status == 2 || postData?.disabled == 1">
      <div class="text-red-500 text-lg font-bold">
        {{ $t('d.gai-tie-zi-yi-bei-feng-jin-huo-jin-yong') }}
      </div>
      <div class="text-gray-content mt-2">
        {{
          $t('d.dang-qian-zheng-zai-shi-yong-guan-li-yuan-quan-xian-cha-kan')
        }}
      </div>
    </div>
    <div v-if="postData?.visible == 0">
      <div class="text-red-500 text-lg font-bold">
        {{ $t('d.gai-tie-zi-yi-xia-jia') }}
      </div>
      <div class="text-gray-content mt-2">
        {{
          $t('d.dang-qian-zheng-zai-shi-yong-guan-li-yuan-quan-xian-cha-kan')
        }}
      </div>
    </div>

    <!-- 详情 -->
    <div v-if="!errorPage" class="flex flex-col w-full gap-6 pr-1 pt-4">
      <!-- 标题 -->
      <h3 v-if="!loading" class="text-lg font-bold" id="post-top">
        {{ postData?.title }}
      </h3>
      <!-- 作者 -->
      <div
        v-if="postData && !loading"
        class="flex gap-2 items-center"
        @click="
          $router.push({
            name: 'mobileUserPanel',
            query: { userId: postData.author.id },
          })
        ">
        <Avatar
          :src="postData.author.headImg || ''"
          :alt="postData.author.nickname"
          :size="28"
          @click.stop="openImg(postData.author.headImg)" />
        <div class="flex flex-wrap gap-x-1 items-center">
          <span class="text-background-content">
            {{ postData.author.nickname }}
          </span>
          <ScRole :user="postData.author" size="sm"></ScRole>
        </div>
      </div>
      <div v-if="loading" id="post-top">
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <div class="skeleton h-7 w-7 shrink-0 rounded-lg"></div>
            <div class="flex flex-col gap-4">
              <div class="skeleton h-4 w-20"></div>
            </div>
          </div>
          <div class="skeleton h-6 w-38"></div>
          <div class="skeleton h-4 w-full"></div>
          <div class="skeleton h-4 w-64"></div>
        </div>
      </div>

      <!-- 文章主体 -->
      <div class="tiptap">
        <div ref="htmlContainer" v-html="postData?.content"></div>
        <div class="border-t border-gray my-8"></div>

        <div class="flex flex-col gap-2">
          <!-- 互动 -->
          <MobileArticleActions
            :postData="postData"
            @updatePost="getPostData" />
          <!-- 前置 -->
          <Dependencies :postData="postData" id="dependencies" />

          <!-- 发布版 -->
          <MobileReleases :postData="postData" id="releases" />

          <!-- 评分 -->
          <MobileScore
            v-if="postData && postData.type == 2"
            :postId="postData?.id"
            class="mb-4"
            id="score-container" />
        </div>
      </div>

      <!-- 评论区 -->
      <MobileCommentArea
        :postData="postData"
        id="comment-container"></MobileCommentArea>
    </div>
    <!-- 错误页面 -->
    <div v-else class="flex flex-col items-center">
      <h2 class="text-xl font-bold my-4">
        {{ $t('d.tie-zi-jia-zai-shi-bai') }}
      </h2>
      <img
        src="/public/wow.webp"
        alt="Error"
        class="w-auto h-40 mb-4 mx-auto" />
      <p class="text-gray-content mb-4">
        {{
          $t(
            'd.ke-neng-shi-tie-zi-bu-cun-zai-huo-yi-bei-shan-chu-nin-ke-yi-chang-shi-shua-xin-ye-mian-huo-fan-hui-shang-yi-ye'
          )
        }}
      </p>
      <ScButton @click="goBack" class="mt-2" Border>{{
        $t('b.fan-hui-shang-yi-ye')
      }}</ScButton>
    </div>
  </div>

  <ScModal v-model="imageModal">
    <div class="relative w-screen h-[100dvh] overflow-hidden">
      <ZoomableImage :src="imgurl" @click-outside="imageModal = false" />
      <button
        class="absolute z-[10] top-[1rem] right-[1rem] rounded-full w-10 h-10 border border-error hover:border-active/80 text-error hover:text-active/80"
        @click="imageModal = false">
        <X class="mx-auto" />
      </button>
    </div>
  </ScModal>

  <ScModal v-model="reportModal">
    <Card class="p-6">
      <div class="flex">
        <h3 class="text-xl mb-4 mr-4">{{ $t('d.ju-bao-tie-zi') }}</h3>
        <div v-if="!userStore.isLogin" class="text-error pt-1">
          {{ $t('t.qing-xian-deng-lu-hou-zai-cao-zuo') }}
        </div>
      </div>

      <div>
        {{ $t('t.tie-zi-biao-ti') }}
        <span class="text-active"> {{ postData?.title }} </span>
      </div>
      <div>
        {{
          $t(
            'd.ni-que-ding-yao-ju-bao-ci-ping-lun-ma-qing-ti-gong-ju-bao-li-you-wo-men-hui-jin-kuai-chu-li'
          )
        }}
      </div>
      <ScInput
        class="mt-4"
        multiline
        :placeholder="$t('d.qing-shu-ru-ju-bao-li-you')"
        :rows="4"
        :maxlength="200"
        v-model="reportReason"></ScInput>
      <div class="flex gap-4 justify-end">
        <ScButton class="px-4" @click="handleReportSubmit" Border>
          {{ $t('b.ti-jiao') }}
        </ScButton>
        <ScButton class="px-4" @click="reportModal = false" Border>
          {{ $t('b.qu-xiao') }}
        </ScButton>
      </div>
    </Card>
  </ScModal>
</template>

<script setup lang="ts">
import type { Post } from '@/types/Post'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { type TocItem } from '@/utils/toc'
import { ChevronLeft, X, Menu } from 'lucide-vue-next'
import ScButton from '@/components/common/ScButton.vue'
import Dependencies from '@/components/pc/post/details/Dependencies.vue'
import Avatar from '@/components/common/Avatar.vue'
import ScRole from '@/components/common/ScRole.vue'
import MobileReleases from '@/components/mobile/post/details/MobileReleases.vue'
import MobileScore from '@/components/mobile/post/details/score/MobileScore.vue'
import ScModal from '@/components/common/ScModal.vue'
import ZoomableImage from '@/components/common/ScZoomableImage.vue'
import MobileCommentArea from '@/components/mobile/post/details/comment/MobileCommentArea.vue'
import PopupBox from '@/components/common/PopupBox.vue'
import Card from '@/components/common/Card.vue'
import ScInput from '@/components/common/ScInput.vue'
import MobileArticleActions from '@/components/mobile/post/details/MobileArticleActions.vue'
import {
  deletePost,
  downPost,
  getPostDetails,
  reportPost,
  setTop,
} from '@/stores/module/post/service'
import { useUserStore } from '@/stores/module/user/userStore'
import { verifyPermissions } from '@/utils/verify'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { formatLink } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const postData = ref<Post | null>(null)
const tocList = ref<TocItem[]>([]) // 文章目录列表
// const postStore = usePostStore() // 获取帖子存储
const imageModal = ref(false) // 图片查看模态框
const imgurl = ref('') // 图片查看地址
const htmlContainer = ref<HTMLElement | null>(null) // HTML内容容器
const postContainer = ref<HTMLElement | null>(null) // 文章内容容器
const userStore = useUserStore() // 用户存储
const errorPage = ref(false) // 错误页面标志
const reportModal = ref(false) // 举报模态框
const reportReason = ref('')
const { t } = useI18n() // 国际化函数
const toast = useToast()
const loading = ref(false) // 加载状态

const adminDeletePost = (postId: number, disabled: number) => {
  if (!verifyPermissions([1, 2, 5])) {
    return
  }
  deletePost(t, postId, disabled == 1 ? 0 : 1, () => {
    // 刷新帖子列表
    getPostData(postId)
  })
}

const unpublishItem = (postId: number, visible: number) => {
  downPost(t, postId, visible == 1 ? 0 : 1, () => {
    getPostData(postId) // 刷新帖子数据
  })
}

const setTopItem = (postId: number, top: number) => {
  setTop(t, postId, top == 0 ? 1 : 0, () => {
    getPostData(postId) // 刷新帖子数据
  })
}

const handleReportSubmit = () => {
  if (!reportModal.value || !postData.value) return
  if (userStore.isLogin === false) {
    toast.error(t('t.qing-xian-deng-lu'))
    return
  }
  if (!reportReason.value.trim()) {
    toast.error(t('t.ju-bao-li-you-bu-neng-wei-kong'))
    return
  }
  reportPost(t, 1, postData.value.id, reportReason.value, () => {
    reportModal.value = false
    reportReason.value = ''
  })
}

const goBack = () => {
  if (window.history.length > 2) {
    window.history.back()
  } else {
    router.push({ name: 'Home' })
  }
}

const bindImageClickEvents = () => {
  const container = htmlContainer.value
  if (!container) return
  const images = container.querySelectorAll('img')
  images.forEach((img) => {
    img.style.cursor = 'pointer'
    img.addEventListener('click', () => openImg(img.src))
  })
}

const openImg = (src: string) => {
  // console.log('Image clicked:', (e.target as HTMLImageElement).src)
  imageModal.value = true
  imgurl.value = formatLink(src)
}

const getPostData = async (id: number) => {
  const { post, toc } = await getPostDetails(id, t)
  postData.value = post
  tocList.value = toc
}

const scrollToHash = (hash: string) => {
  console.log('Scrolling to hash:', hash)

  const id = hash.replace('#', '')
  const element = document.getElementById(id)

  if (!element) {
    console.warn(`Element with ID '${id}' not found.`)
    return
  }

  const offset = 80
  const elementRect = element.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const offsetPosition = elementRect.top + scrollTop - offset

  console.log(`Scrolling to position: ${offsetPosition}`)

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  })

  if (postContainer.value) {
    postContainer.value.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }
}

onMounted(async () => {
  loading.value = true
  const postId = route.params.postId
  const details = await getPostDetails(+postId, t)
  if (!details.post) {
    errorPage.value = true // 设置错误页面标志
    return
  } else {
    postData.value = details.post
    tocList.value = details.toc
  }
  loading.value = false

  nextTick(() => {
    bindImageClickEvents()
  })

  if (route.hash) {
    nextTick(() => {
      scrollToHash(route.hash)
    })
  }
})

onUnmounted(() => {
  postData.value = null // 清理数据
  tocList.value = [] // 清理目录列表
  errorPage.value = false // 重置错误页面标志
})

watch(
  () => route.params,
  async (newParams) => {
    getPostData(+newParams.postId)
  }
)

// 监听路由hash变化
watch(
  () => route.hash,
  (newHash) => {
    console.log('newHash', newHash)
    if (newHash) {
      scrollToHash(newHash)
    }
  }
)

watch(postData, async () => {
  await nextTick()
  bindImageClickEvents()
})
</script>
