<template>
  <nav>
    <ul v-if="show" ref="menuList" class="flex gap-4 relative p-0">
      <li
        v-for="(item, index) in menuItems"
        :key="item.pathName"
        class="list-none cursor-pointer"
        :class="{ 'text-primary': activeNavName === item.pathName }"
        @click="setActive(index)">
        <button
          class="navitem inline-block px-2 transition-colors cursor-pointer"
          :class="{ 'text-primary': activeNavName === item.pathName }">
          {{ item.name }}
        </button>
      </li>
      <div
        class="absolute bottom-[-2px] h-1 transition-all"
        :style="indicatorStyle">
        <div class="w-4 h-1 bg-primary rounded-full mx-auto my-0"></div>
      </div>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface MenuItem {
  name: string
  params?: {
    plateId: number
  }
  pathName?: string
}

interface HomeNavProps {
  menuItems: MenuItem[]
  activeNavName: string
  isRouterLink?: boolean
  updateNav?: (name: string) => void
  updatePage: (page: number) => void
}

const props = defineProps<HomeNavProps>()

const route = useRoute()
const router = useRouter()
const menuList = ref<HTMLElement>()
const activeIndex = ref(0)
const indicatorStyle = ref({
  left: '0px',
  width: '0px',
})
const show = ref(true)

const isMenuItem = computed(() => {
  return props.menuItems.some((item) => item.pathName === route.name)
})

const updateIndicator = () => {
  nextTick(() => {
    if (!menuList.value?.children?.[activeIndex.value]) return
    if (!isMenuItem.value) return

    const activeElement = menuList.value.children[
      activeIndex.value
    ] as HTMLElement
    const linkElement = activeElement.querySelector('button') as HTMLElement

    if (linkElement) {
      const { left: parentLeft } = menuList.value.getBoundingClientRect()
      const { width: linkWidth, left: linkLeft } =
        linkElement.getBoundingClientRect()

      indicatorStyle.value = {
        left: `${linkLeft - parentLeft}px`,
        width: `${linkWidth}px`,
      }
    }
  })
}

const setActive = (index: number) => {
  activeIndex.value = index
  if (props.menuItems[index].pathName && props.updateNav) {
    props.updateNav(props.menuItems[index].pathName)
  }
  props.updatePage(index)
  if (!props.menuItems[index].pathName) return
  updateIndicator()

  if (props.isRouterLink === false) return
  router.push({
    name: props.menuItems[index].pathName,
    params: props.menuItems[index].params || {},
  })
}

const updateActiveIndex = () => {
  const index = props.menuItems.findIndex(
    (item) => item.pathName === route.name
  )
  show.value = true
  activeIndex.value = index !== -1 ? index : 0
  updateIndicator()
}

// 初始化
onMounted(() => {
  if (props.updateNav) {
    props.updateNav((route.name as string) || '')
  }
  if (isMenuItem.value) {
    updateActiveIndex()
  } else {
    show.value = false
  }
})

// 监听路由变化
watch(
  () => route.name,
  () => {
    // 判断当前name是否属于menuItems中的一项
    if (isMenuItem.value) {
      updateActiveIndex()
      updateIndicator()
    } else {
      show.value = false
    }
  },
  { immediate: true }
)

// 监听窗口变化
window.addEventListener('resize', updateIndicator)
</script>
