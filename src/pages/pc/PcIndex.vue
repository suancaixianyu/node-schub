<template>
  <!-- 主窗口 -->
  <div class="mx-auto max-w-[1600px]">
    <HomeHeader />
    <div class="w-full mx-auto px-4 pt-1">
      <!-- 主页PostIndex -->
      <router-view></router-view>
    </div>
    <div
      class="text-center"
      v-if="verifyPermissions([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])">
      updateTime: 2025年12月1日22:14:54
    </div>
    <PopUpAnnouncement />
  </div>
  <!-- <div class="absolute bottom-0 right-0"><DevTools /></div> -->
</template>

<script setup lang="ts">
import HomeHeader from '@/components/pc/homeHeader/HomeHeader.vue'
import PopUpAnnouncement from '@/components/common/PopUpAnnouncement.vue'
import { verifyPermissions } from '@/utils/verify'
// import DevTools from '@/components/common/DevTools.vue'
</script>
