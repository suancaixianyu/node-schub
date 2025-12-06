<template>
  <div class="flex w-full gap-x-6 justify-between px-1">
    <!-- 主页,横向排列 -->
    <!-- <PostPlate /> -->
    <PostList />
    <BulletinBoard />
  </div>
</template>

<script setup lang="ts">
import PostList from '@/components/pc/post/PostList.vue'
// import PostPlate from '@/components/pc/post/PostPlate.vue'
import BulletinBoard from '@/components/pc/post/BulletinBoard.vue'
</script>
