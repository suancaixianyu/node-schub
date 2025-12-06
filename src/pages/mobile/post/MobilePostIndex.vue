<template>
  <div class="absolute top-0 z-40 bg-white w-full">
    <MobileHomeNav />
  </div>

  <div class="h-12"></div>
  <!-- 横幅公告 -->
  <div v-if="show" class="flex justify-center w-full bg-warning/30">
    <span @click="toAnnouncement">{{ announcementPostData?.title }}</span>
    <ScButton
      class="ml-4"
      :icon="X"
      @click="offAnnouncement(announcementPostData?.id)"
      noPd
      noBg>
    </ScButton>
  </div>

  <div class="flex flex-col px-4 pt-2">
    <div class="space-y-4 pb-4">
      <!-- 子版块 -->
      <MobilePlate />
      <div class="flex gap-2">
        <ScInput
          v-model="postStore.searchText"
          class="flex-1"
          :placeholder="$t('t.sou-suo-tie-zi-biao-ti')" />
        <ScButton
          :icon="Search"
          noPd
          @click="
            handleSearch(postStore.searchText, true, String(postStore.fileType))
          ">
          {{ $t('b.sou-suo') }}
        </ScButton>

        <PopupBox
          v-if="route.name == 'modList'"
          ref="popupBox"
          position="bottom-left"
          :icon="Funnel"
          className="mt-1 py-1.5 px-1"
          noPd>
          <template #default="{ close }">
            <Card noPg class="p-2 w-22 items-center">
              <ScButtonSelector
                col
                :options="fileTypeOptions"
                v-model="postStore.fileType"
                @click="close()" />
            </Card>
          </template>
        </PopupBox>

        <PopupBox
          ref="popupBox"
          position="bottom-left"
          :icon="ArrowDownWideNarrow"
          className="mt-1 py-1.5 px-1"
          noPd>
          <template #default="{ close }">
            <Card noPg class="p-2 w-22 items-center">
              <ScButtonSelector
                col
                :options="orderTypeOptions"
                v-model="postStore.orderType"
                @click="close()" />
            </Card>
          </template>
        </PopupBox>
      </div>
    </div>

    <!-- 公告 -->
    <template v-if="topPosts.length">
      <div class="space-y-2 pb-2">
        <ScAccordionItem v-model:open="openTopPosts" :Border="false">
          <template #title>
            <span
              class="flex gap-2"
              @click="
                $router.push({
                  name: 'postDetails',
                  params: { postId: topPosts[0].id },
                })
              ">
              <Megaphone />
              {{ topPosts[0].title }}
            </span>
          </template>
          <template #content>
            <div class="flex flex-col">
              <div
                v-for="post in topPosts.slice(1)"
                :key="post.id"
                class="flex gap-2"
                @click="
                  $router.push({
                    name: 'postDetails',
                    params: { postId: post.id },
                  })
                ">
                <Megaphone />

                <span>{{ post.title }}</span>
              </div>
            </div>
          </template>
        </ScAccordionItem>
      </div>
    </template>

    <!-- 帖子列表 -->
    <div class="space-y-4">
      <template v-if="postStore.post.length">
        <MobilePostItem
          v-for="post in postStore.post"
          :key="post.id"
          :post="post" />
      </template>
    </div>
  </div>

  <div
    ref="draggableButton"
    @touchstart.passive="startDrag"
    @touchmove="onDrag"
    @touchend="stopDrag"
    class="absolute right-6 flex items-center justify-center z-3"
    :style="buttonStyle">
    <button
      ref="toTopButton"
      class="absolute scale-10 bg-active w-12 h-12 text-active-content rounded-full flex items-center justify-center shadow-md"
      @click="toTop">
      <ArrowUpToLine :size="24" />
    </button>
    <button
      class="relative bg-active z-3 w-12 h-12 text-active-content rounded-full flex items-center justify-center shadow-md"
      @click="handleClick">
      <Plus :size="24" />
    </button>
    <button
      ref="leftPage"
      class="absolute z-2 scale-10 bg-active h-8 text-active-content overflow-hidden rounded-[2rem] flex items-center justify-center shadow-md">
      {{ postStore.postPage.page }} / {{ totalPages }}
    </button>
  </div>

  <Pagination
    :current-page="postStore.postPage.page"
    :total-items="postStore.postPage.total"
    :page-size="postStore.postPage.limit"
    @page-change="setPage" />

  <div class="w-full min-h-4"></div>
</template>

<script setup lang="ts">
import MobilePostItem from '@/components/mobile/post/MobilePostItem.vue'
import MobileHomeNav from '@/components/mobile/homeHeader/MobileHomeNav.vue'
import MobilePlate from '@/components/mobile/homeHeader/MobilePlate.vue'
import ScInput from '@/components/common/ScInput.vue'
import ScButton from '@/components/common/ScButton.vue'
import { usePostStore } from '@/stores/module/post/postStore'
import { computed, onMounted, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getFileTypeOptions,
  getPost,
  getSortOptions,
  search,
} from '@/stores/module/post/service'
import ScButtonSelector from '@/components/common/ScButtonSelector.vue'
import {
  Funnel,
  Plus,
  Search,
  ArrowUpToLine,
  X,
  ArrowDownWideNarrow,
} from 'lucide-vue-next'
import Pagination from '@/components/common/Pagination.vue'
import PopupBox from '@/components/common/PopupBox.vue'
import Card from '@/components/common/Card.vue'
import { useI18n } from 'vue-i18n'
import { inject } from 'vue'
import { gsap } from 'gsap'
import { useAnnouncementStore } from '@/stores/global/announcementStore'
import type { Post } from '@/types/Post'
import { postApi } from '@/apis'
import { formatTimeOrAgo } from '@/utils/format'
import { Megaphone } from 'lucide-vue-next'
import ScAccordionItem from '@/components/common/ScAccordionItem.vue'

const progress = inject('refreshScroll', ref(0))
const containerRef = inject('containerRef', ref<HTMLElement | null>(null))
const postStore = usePostStore()
const { t } = useI18n()
const route = useRoute()
const plateId = ref<string>(route.params.plateId as string)
const fileTypeOptions = getFileTypeOptions(t)
const show = ref(false) // 显示置顶公告
const announcementStore = useAnnouncementStore()
const orderTypeOptions = getSortOptions(t)
const totalPages = computed(() =>
  Math.ceil(postStore.postPage.total / postStore.postPage.limit)
)
const announcementPostData = ref<Post | null>(null)

const router = useRouter()
const draggableButton: Ref<HTMLButtonElement | null> = ref(null)
const toTopButton: Ref<HTMLButtonElement | null> = ref(null)
const leftPage: Ref<HTMLButtonElement | null> = ref(null)

const isDragging = ref<boolean>(false)
const startY = ref<number>(0)
const startBottom = ref<number>(0)
const startTime = ref<number>(0)
const topPosts = ref<Post[]>([]) // 置顶帖子列表
const openTopPosts = ref(false) // 是否展开置顶帖子列表

const buttonStyle = computed(() => ({
  bottom: `${postStore.buttonBottom}px`,
  touchAction: 'none',
}))

const toTop = () => {
  if (containerRef && containerRef.value) {
    containerRef.value.scrollTo({
      top: 0, // 滚动到顶部
      behavior: 'smooth', // 可选：平滑滚动
    })
    gsap.to(leftPage.value, {
      keyframes: [
        { scale: 1, right: '4rem', width: '100%', duration: 0.3 },
        { scale: 1, right: '4rem', width: '100%', duration: 1.5 },
        { scale: 1, right: '1rem', width: '5%', duration: 0.3 },
      ],
    })
  }
}

const offAnnouncement = (id?: number) => {
  if (id) {
    announcementStore.popUps.push(id)
    announcementStore.popUps = Array.from(new Set(announcementStore.popUps)) // 去重
  }
  show.value = false
}

const toAnnouncement = () => {
  show.value = false
  if (!announcementPostData.value) return
  router.push({
    name: 'postDetails',
    params: {
      postId: announcementPostData.value.id,
    },
  })
}

const getAnnouncement = (postList: Post[]): Post | null => {
  const popUpIds = new Set(announcementStore.popUps)
  const diffPost = postList.find((post) => !popUpIds.has(post.id))
  return diffPost ?? null
}

const handleClick = (e: MouseEvent | TouchEvent) => {
  if (isDragging.value) {
    e.preventDefault()
    return
  }
  router.push({ name: 'publishPost' })
}

const startDrag = (e: TouchEvent) => {
  isDragging.value = true
  startY.value = e.touches[0].clientY
  startBottom.value = postStore.buttonBottom
  startTime.value = e.timeStamp
}

const onDrag = (e: TouchEvent) => {
  if (!isDragging.value || !draggableButton.value) return

  e.preventDefault()
  const currentY = e.touches[0].clientY
  const deltaY = startY.value - currentY
  postStore.buttonBottom = startBottom.value + deltaY

  // 限制拖动范围（距离顶部20px，距离底部20px）
  const maxBottom = window.innerHeight - draggableButton.value.offsetHeight - 20
  postStore.buttonBottom = Math.max(
    20,
    Math.min(postStore.buttonBottom, maxBottom)
  )
}

const stopDrag = () => {
  isDragging.value = false
}

const setPage = async (page: number) => {
  postStore.postPage.page = page
  toTop()
  await getPost(+plateId.value, route, t)
}

const handleSearch = (
  searchText: string,
  click: boolean,
  fileTypes: string
) => {
  console.log('searchText', searchText)

  postStore.searchText = searchText
  postStore.isSearch = true
  postStore.postPage.page = 1
  postStore.postPage.total = 0
  search(searchText, click, fileTypes, route, t)
}

watch(
  () => route.params,
  (newPlate) => {
    console.log(newPlate)

    if (newPlate.plateId) {
      plateId.value = newPlate.plateId as string
      postStore.postPage.page = 1
      postStore.postPage.limit = 10
      getPost(+newPlate.plateId, route, t)
    }
  },
  { immediate: true }
)
watch(
  () => postStore.fileType,
  () => {
    search(postStore.searchText, true, String(postStore.fileType), route, t)
  }
)
watch(
  () => postStore.orderType,
  () => {
    search(postStore.searchText, true, String(postStore.fileType), route, t)
  }
)

watch(progress, () => {
  if (progress.value > 0.2) {
    gsap.to(toTopButton.value, { scale: 1, bottom: '4rem', duration: 0.3 })
  } else {
    gsap.to(toTopButton.value, { scale: 0, bottom: '0', duration: 0.3 })
  }
})

onMounted(() => {
  // 初始化或获取数据
  postStore.currentPlate.currentRouteName = (route.name as string) || ''
  postStore.searchText = ''

  postApi
    .getPostList({
      top: 2,
    })
    .then((res) => {
      announcementPostData.value = getAnnouncement(res.data.data.list)
      if (announcementPostData.value) {
        show.value = true
      }
    })

  postApi.getPostListTop().then((res) => {
    if (res.data.code == 200) {
      topPosts.value = res.data.data.list.map((item: Post) => {
        item.createdAt = formatTimeOrAgo(item.createdAt, t)
        return item
      })
    }
  })
})
</script>
