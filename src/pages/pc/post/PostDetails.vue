<template>
  <div v-if="!loading" class="pb-2" ref="postContainer">
    <!-- 导航 -->
    <!-- 面包屑 -->

    <div v-if="postData" class="breadcrumbs text-sm ml-4" id="post-top">
      <ul>
        <li>
          <ScButton noPadding @click="goBack"> <Home :size="18" /> </ScButton>
        </li>
        <li>
          <RouterLink
            :to="{
              name: postData?.type == 1 ? 'postList' : 'modList',
              params: { plateId: postData?.plate.id },
            }">
            {{
              postData?.type == 1
                ? $t('nav.jiao-liu-tie-zi')
                : $t('nav.zi-yuan-xia-zai')
            }}
          </RouterLink>
        </li>
        <li>
          <RouterLink
            :to="{
              name: postData?.type == 1 ? 'postList' : 'modList',
              params: { plateId: postData?.plate.id },
            }">
            {{ postData?.plate.name }}
          </RouterLink>
        </li>
        <li>{{ postData?.title }}</li>
      </ul>
    </div>

    <div v-if="!errorPage && postData" class="flex gap-6 pt-4">
      <!-- 左侧按钮 -->
      <ArticleActions :postData="postData" @updatePost="getPost" />

      <!-- 文章主体 -->
      <div class="tiptap flex-1 w-7/10 min-w-xl p-1">
        <div ref="htmlContainer" v-html="postData?.content"></div>
        <div class="border-t border-gray my-8"></div>

        <!-- 发布版 -->
        <Releases :postData="postData" id="releases" />

        <!-- 评分 -->
        <Score
          v-if="postData && postData.type == 2"
          :postId="postData?.id"
          id="score-container"
          class="mb-4" />

        <!-- 评论区 -->
        <CommentArea :postData="postData" id="comment-container"></CommentArea>
      </div>

      <!-- 右侧卡片 -->
      <div class="max-w-xs min-w-60 relative">
        <div class="flex flex-col gap-4 no-scrollbar p-2">
          <Card v-if="postData?.status == 2 || postData?.disabled == 1">
            <div class="text-red-500 text-lg font-bold">
              {{ $t('d.gai-tie-zi-yi-bei-feng-jin-huo-jin-yong') }}
            </div>
            <div class="text-gray-content mt-2">
              {{
                $t(
                  'd.dang-qian-zheng-zai-shi-yong-guan-li-yuan-quan-xian-cha-kan'
                )
              }}
            </div>
          </Card>

          <Card v-if="postData?.visible == 0">
            <div class="text-red-500 text-lg font-bold">
              {{ $t('d.gai-tie-zi-yi-xia-jia') }}
            </div>
            <div class="text-gray-content mt-2">
              {{
                $t(
                  'd.dang-qian-zheng-zai-shi-yong-guan-li-yuan-quan-xian-cha-kan'
                )
              }}
            </div>
          </Card>

          <!-- 目录 -->
          <TableOfContents :postData="postData" :tocList="tocList" />

          <!-- 作者 -->
          <Author :postData="postData" />

          <!-- 前置 -->
          <Dependencies :postData="postData" />

          <!-- 发布版 -->
          <!-- <Releases :postData="postData" /> -->
        </div>
      </div>
    </div>
    <!-- 错误页面 -->
    <div v-else class="flex flex-col items-center justify-center h-full">
      <Card class="w-96 text-center">
        <h2 class="text-xl font-bold mb-4">
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
      </Card>
    </div>
  </div>

  <ScModal v-model="imageModal">
    <div class="relative w-[90vw] h-[90vh] overflow-hidden">
      <ZoomableImage :src="imgurl" @click-outside="imageModal = false" />
      <button
        class="absolute z-[10] top-[5rem] right-[5rem] rounded-full w-10 h-10 border border-error hover:border-active/80 text-error hover:text-active/80"
        @click="imageModal = false">
        <X class="mx-auto" />
      </button>
    </div>
  </ScModal>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, X } from 'lucide-vue-next'
import ScButton from '@/components/common/ScButton.vue'
import Dependencies from '@/components/pc/post/details/Dependencies.vue'
import Author from '@/components/pc/post/details/Author.vue'
import Releases from '@/components/pc/post/details/Releases.vue'
import TableOfContents from '@/components/pc/post/details/TableOfContents.vue'
import ArticleActions from '@/components/pc/post/details/ArticleActions.vue'
import Card from '@/components/common/Card.vue'
import CommentArea from '@/components/pc/post/details/comment/CommentArea.vue'
import Score from '@/components/pc/post/details/score/Score.vue'
import ScModal from '@/components/common/ScModal.vue'
import ZoomableImage from '@/components/common/ScZoomableImage.vue'
import { getPostDetails } from '@/stores/module/post/service'
import type { Post } from '@/types/Post'
import type { TocItem } from '@/utils/toc'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const postData = ref<Post | null>(null) // 获取帖子数据
const tocList = ref<TocItem[]>([]) // 获取目录列表
const errorPage = ref(false) // 获取错误页面标志

const imageModal = ref(false) // 图片查看模态框
const imgurl = ref('') // 图片查看地址
const htmlContainer = ref<HTMLElement | null>(null) // HTML内容容器
const postContainer = ref<HTMLElement | null>(null) // 文章内容容器
const loading = ref(false) // 加载状态

const getPost = async (postId: number) => {
  const { post, toc } = await getPostDetails(postId, t)
  postData.value = post
  tocList.value = toc
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
    img.addEventListener('click', openImg)
  })
}

const openImg = (e: MouseEvent) => {
  // console.log('Image clicked:', (e.target as HTMLImageElement).src)
  imageModal.value = true
  imgurl.value = (e.target as HTMLImageElement).src
}

const scrollToHash = (hash: string) => {
  console.log('Scrolling to hash:', hash)

  const id = hash.replace('#', '')
  const element = document.getElementById(id)
  if (element) {
    const offset = 80
    const elementRect = element.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const offsetPosition = elementRect.top + scrollTop - offset

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
}

onMounted(async () => {
  loading.value = true
  const postId = route.params.postId
  const { post, toc } = await getPostDetails(+postId, t)
  postData.value = post
  tocList.value = toc
  if (post) {
    nextTick(() => {
      bindImageClickEvents()
    })

    loading.value = false
  }

  console.log('哈希', route.hash)

  if (route.hash) {
    nextTick(() => {
      scrollToHash(route.hash)
      window.scrollTo({
        top: 900,
        behavior: 'smooth',
      })
    })
  }
})

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

watch(
  () => route.params.postId,
  (newValue, oldValue) => {
    if (newValue != oldValue) {
      getPost(+newValue)
    }
  }
)

watch(postData, async () => {
  await nextTick()
  bindImageClickEvents()
})
</script>
