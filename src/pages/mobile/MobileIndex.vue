<template>
  <div
    ref="containerRef"
    class="overflow-y-auto overflow-x-hidden w-[100vw] h-[100dvh]">
    <!-- 内容列表 - 这个区域现在会填充剩余空间 -->
    <!-- 主页MobilePostIndex -->
    <div class="home-content">
      <RouterView />
    </div>
    <div
      class="text-center"
      v-if="verifyPermissions([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])">
      updateTime: 2025年12月1日22:14:54
    </div>
  </div>
  <PopUpAnnouncement />
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PopUpAnnouncement from '@/components/common/PopUpAnnouncement.vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { verifyPermissions } from '@/utils/verify'

gsap.registerPlugin(ScrollTrigger)

const containerRef = ref<HTMLElement | null>(null)
const progress = ref(0)
provide('refreshScroll', progress)
provide('containerRef', containerRef)

const route = useRoute()
const routeName = ref('')

onMounted(() => {
  if (!containerRef.value) return
  // 确保内容高度大于容器高度
  const content = containerRef.value.querySelector(
    '.home-content'
  ) as HTMLElement

  ScrollTrigger.create({
    scroller: containerRef.value,
    trigger: content,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      progress.value = self.progress
    },
  })
})

onBeforeUnmount(() => {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
})

watch(
  () => route.path,
  (newPath) => {
    routeName.value = newPath
  },
  { immediate: true }
)
</script>
