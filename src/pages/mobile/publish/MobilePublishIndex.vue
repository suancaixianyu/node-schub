<template>
  <div
    v-if="loadError"
    class="flex flex-col items-center justify-center h-full w-full overflow-x-hidden">
    <EmptyState
      :title="$t('t.jia-zai-shi-bai')"
      :description="$t('t.qing-shua-xin-ye-mian-huo-dian-ji-xia-fang-fan-hui')"
      :action="$t('b.fan-hui')"
      :actionIcon="Undo2"
      @action-click="$router.back()" />
  </div>

  <router-view v-else />
</template>

<script setup lang="ts">
import { postApi } from '@/apis'
import { onMounted, ref } from 'vue'
import { Undo2 } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Post } from '@/types/Post'

const route = useRoute()
const createType = ref('')
const loadError = ref(false)
const currentPostId = ref<number>(0)
const loading = ref(true)
const postData = ref<Post | null>(null)

onMounted(async () => {
  const postId = route.params.postId
  if (postId) {
    currentPostId.value = +postId
    const res = await postApi.getPostDetail(+postId)
    if (res.data.code === 200) {
      postData.value = res.data.data as Post
      loading.value = false
    } else {
      loadError.value = true
      loading.value = false
      console.error('帖子加载失败:', res.data.message)
    }
  }
  createType.value = route.name as string
  loading.value = false
})
</script>
