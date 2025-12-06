<template>
  <div class="flex flex-col gap-4 h-full w-1/5 min-w-xs px-1 pt-1 no-scrollbar">
    <Creation />
    <Card class="flex flex-col gap-2">
      <h2 class="card-title px-1.5">{{ $t('d.gong-gao-lan') }}</h2>
      <div v-for="post in posts">
        <div
          @click="handleClick(post)"
          class="flex gap-2 items-center px-1.5 py-1 hover:bg-gray/50 rounded-md cursor-pointer transition-all">
          <ScTag status="warning"> {{ $t('b.zhi-ding') }} </ScTag>
          <div class="font-bold">{{ post.title }}</div>
        </div>
      </div>
      <div v-if="!posts.length">
        <div class="text-gray-content text-center text-sm px-1.5 py-2">
          {{ $t('d.sha-ye-mei-you-o') }}
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Card from '@/components/common/Card.vue'
import { useRouter } from 'vue-router'

import Creation from './Creation.vue'
import type { Post } from '@/types/Post'
import { onMounted, ref } from 'vue'
import { postApi } from '@/apis'
import { formatTimeOrAgo } from '@/utils/format'
import ScTag from '@/components/common/ScTag.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

const handleClick = (post: { id: any }) => {
  router.push({
    name: 'postDetails',
    params: { postId: post.id },
  })
}

const posts = ref<Post[]>([])

const getPost = () => {
  postApi.getPostListTop('1,2,3').then((res) => {
    if (res.data.code === 200) {
      posts.value = res.data.data.list.map((item: any) => {
        item.createdAt = formatTimeOrAgo(item.createdAt, t)
        item.updatedAt = formatTimeOrAgo(item.updatedAt, t)
        return item
      })
    }
  })
}

onMounted(() => {
  getPost()
})
</script>
