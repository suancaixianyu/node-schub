import { useToast } from 'vue-toastification'
import { plateApi, postApi, reportApi } from '@/apis'
import { usePostStore } from '@/stores/module/post/postStore'
import type { Api } from '@/types'
import type { Plate } from '@/types/Plate'
import {
  formatNumber,
  formatTimeOrAgo,
  lightHtml,
  markedToHtml,
} from '@/utils/format'
import { extractImageSrcs, formatImageSrcsInHtml } from '@/utils/regex'
import type { PostListQueryDto } from '@/types/PostListQueryDto'
import type { Post } from '@/types/Post'
import type { RouteLocationNormalizedLoadedGeneric, Router } from 'vue-router'
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-vue-next'

import { generateTocFromHtml } from '@/utils/toc'
import { useUserStore } from '../user/userStore'
import type { MenuItem } from '@/types/Config'

const toast = useToast()
const postStore = usePostStore()
const userStore = useUserStore()

export const getMenuItems = (t: any): MenuItem[] => {
  return [
    {
      name: t('nav.zi-yuan-xia-zai'),
      pathName: 'modList',
      params: { plateId: 0 },
      type: 2,
    },
    {
      name: t('nav.jiao-liu-tie-zi'),
      pathName: 'postList',
      params: { plateId: 0 },
      type: 1,
    },
  ]
}

export const getfileTypes = (t: any) => {
  return [
    { value: 1, label: t('b.cun-dang') },
    { value: 2, label: t('b.jia-ju') },
    { value: 3, label: t('b.cai-zhi') },
    { value: 4, label: t('b.pi-fu') },
    { value: 5, label: t('b.mo-zu') },
    { value: 8, label: t('b.lian-ji-mo-zu') },
    { value: 7, label: t('b.qi-ta') },
  ]
}
/** 获取文件标签 */
export const getFileTypeOptions = (t: any) => {
  return [
    { value: 0, label: t('b.quan-bu') },
    { value: 1, label: t('b.cun-dang') },
    { value: 2, label: t('b.jia-ju') },
    { value: 3, label: t('b.cai-zhi') },
    { value: 4, label: t('b.pi-fu') },
    { value: 5, label: t('b.mo-zu') },
    { value: 8, label: t('b.lian-ji-mo-zu') },
    { value: 7, label: t('b.qi-ta') },
  ]
}
/** 获取排序选项 */
export const getSortOptions = (t: any) => {
  return [
    { value: 1, label: t('b.zui-xin'), icon: ArrowDownWideNarrow },
    { value: 2, label: t('b.zui-zao'), icon: ArrowUpNarrowWide },
    // { value: 3, label: t('b.zui-zan'), icon: ArrowDownWideNarrow },
  ]
}

/** 获取板块列表 */
export const getPlate = async (t: any) => {
  const typeId =
    getMenuItems(t).find(
      (item) => item.pathName === postStore.currentPlate.currentRouteName
    )?.type || 1
  plateApi
    .getPlateList()
    .then((res: Api) => {
      const data = res.data
      if (data.code !== 200) {
        return toast.error(t('t.huo-qu-ban-kuai-shi-bai'))
      }
      const plates = data.data as Plate[]

      postStore.plate[postStore.currentPlate.currentRouteName] = plates.filter(
        (plate) => plate.type === typeId
      )
    })
    .catch((error) => {
      toast.error(t('t.huo-qu-ban-kuai-shi-bai'))
      console.error('获取板块失败:', error)
    })
}

/** 点击切换板块 */
export const handleCardClick = (
  plateId: number,
  route: RouteLocationNormalizedLoadedGeneric,
  router: Router
) => {
  router.push({ name: route.name, params: { plateId } })
  postStore.currentPlate.activation = plateId
}

/** 跳转分页 */
export const toPage = (
  page: number,
  route: RouteLocationNormalizedLoadedGeneric,
  t: any
) => {
  postStore.postPage.page = page
  getPost(postStore.plateId, route, t)
}

/** 获取帖子 */
export const getPost = async (
  pid: number, // 板块id
  route: RouteLocationNormalizedLoadedGeneric,
  t: any
) => {
  if (
    postStore.isSearch &&
    postStore.searchText &&
    postStore.searchText.trim()
  ) {
    search(postStore.searchText, false, '0', route, t)
    return
  }
  const query: PostListQueryDto = {
    type: route.name == 'postList' ? 1 : 2,
  }

  if (postStore.orderType !== 0) {
    query.orderType = postStore.orderType
  }
  if (pid !== 0) {
    query.plateId = pid
  }
  if (postStore.fileType !== 0 && query.type == 2) {
    query.fileTypes = String(postStore.fileType)
  }
  query.page = postStore.postPage.page
  query.limit = postStore.postPage.limit
  postApi.getPostList(query).then((response: Api) => {
    const res = response.data
    if (res.code === 200) {
      postStore.post = res.data.list.map((item: Post) => {
        // 处理图片链接
        item.images = extractImageSrcs(item.content)
        item.content = formatImageSrcsInHtml(item.content)
        item.createdAt = formatTimeOrAgo(item.createdAt, t)
        item.updatedAt = formatTimeOrAgo(item.updatedAt, t)
        item.likeCount = formatNumber(item.likeCount)
        item.commentCount = formatNumber(item.commentCount)
        item.views = formatNumber(item.views)
        return item
      })
      postStore.postPage.page = res.data.page
      postStore.postPage.total = res.data.total
      postStore.postPage.limit = res.data.limit
    }
  })
}

/** 搜索帖子 */
export const search = (
  key: string,
  click = true,
  fileTypes = '0',
  route: RouteLocationNormalizedLoadedGeneric,
  t: any
) => {
  console.log('fileTypes', fileTypes)

  if (click) {
    postStore.postPage.page = 1
  }
  postStore.searchText = key == '' ? '' : key.trim()
  postStore.isSearch = true
  const query: PostListQueryDto = {
    type: route.name == 'postList' ? 1 : 2,
  }

  if (postStore.orderType !== 0) {
    query.orderType = postStore.orderType
  }

  if (postStore.plateId && postStore.plateId !== 0) {
    query.plateId = postStore.plateId
  }

  if (fileTypes && fileTypes != '0' && query.type == 2) {
    query.fileTypes = fileTypes
  }

  if (postStore.searchText != '') {
    query.title = postStore.searchText
  }

  query.page = postStore.postPage.page
  query.limit = postStore.postPage.limit

  console.log('query', query)

  postApi.getPostList(query).then((response: Api) => {
    const res = response.data
    if (res.code === 200) {
      postStore.post = res.data.list.map((item: Post) => {
        // 处理图片链接
        item.images = extractImageSrcs(item.content)
        item.createdAt = formatTimeOrAgo(item.createdAt, t)
        item.updatedAt = formatTimeOrAgo(item.updatedAt, t)
        return item
      })
      postStore.postPage.page = res.data.page
      postStore.postPage.total = res.data.total
      postStore.postPage.limit = res.data.limit
    }
  })
}
/** 获取帖子详情 */
export const getPostDetails = async (postId: number, t: any) => {
  postStore.postData = null // 清理数据
  postStore.tocList = [] // 清理目录列表
  postStore.errorPage = false // 重置错误页面标志
  return postApi
    .getPostDetail(postId)
    .then(async (response: Api) => {
      const data = response.data.data as Post
      data.createdAt = formatTimeOrAgo(data.createdAt, t)
      data.updatedAt = formatTimeOrAgo(data.updatedAt, t)
      data.commentCount = formatNumber(data.commentCount)
      data.likeCount = formatNumber(data.likeCount)
      data.badCount = formatNumber(data.badCount)
      data.postVersions = data.postVersions.map((item) => ({
        ...item,
        content: lightHtml(formatImageSrcsInHtml(item.content)),
        createdAt: formatTimeOrAgo(item.createdAt, t),
      }))
      const toc = generateTocFromHtml(data.content)
      data.content = lightHtml(
        formatImageSrcsInHtml(await markedToHtml(toc.html))
      )
      postStore.tocList = toc.items
      postStore.postData = data
      postStore.errorPage = false // 重置错误页面标志
      return {
        post: data,
        toc: toc.items,
      }
    })
    .catch((error) => {
      console.error('Error fetching post details:', error)
      toast.error(error.msg)
      postStore.errorPage = true
      return {
        post: null,
        toc: [],
      }
    })
}

/** 删除帖子 */
export const deletePost = (
  t: any,
  postId: number,
  disabled: number,
  close?: () => void
) => {
  postApi
    .deletePostAsAdmin({
      id: postId,
      disabled: disabled,
    })
    .then((response) => {
      if (response.data.code === 200) {
        if (close) {
          close()
        }
        toast.success(t('t.cao-zuo-cheng-gong'))
      }
    })
    .catch((error) => {
      toast.error(t('t.qing-qiu-shi-bai') + error.msg)
    })
}

/** 下架帖子 */
export const downPost = (
  t: any,
  postId: number,
  visible: number,
  close?: () => void
) => {
  postApi
    .updatePost({
      id: postId,
      visible: visible,
    })
    .then((response) => {
      if (response.data.code === 200) {
        // 刷新帖子列表
        if (close) {
          close()
        }
        toast.success(t('t.cao-zuo-cheng-gong'))
      }
    })
    .catch((error) => {
      toast.error(t('t.qing-qiu-shi-bai') + error.msg)
    })
}

/** 置顶 */
export const setTop = (
  t: any,
  postId: number,
  top: number,
  close?: () => void
) => {
  postApi
    .updatePostAsAdmin({
      id: postId,
      top: top,
    })
    .then((response) => {
      if (response.data.code === 200) {
        // 刷新帖子列表
        if (close) {
          close()
        }
        toast.success(t('t.cao-zuo-cheng-gong'))
      }
    })
    .catch((error) => {
      toast.error(t('t.qing-qiu-shi-bai') + error.msg)
    })
}

/** 举报 */
export const reportPost = (
  t: any,
  targetType: number,
  targetId: number,
  reason: string,
  close?: () => void
) => {
  reportApi
    .createReport({
      targetType: targetType,
      targetId: targetId,
      reason: reason,
    })
    .then((response) => {
      if (response.data.code === 200) {
        if (close) {
          close()
        }
        toast.success(t('t.ju-bao-yi-ti-jiao-wo-men-hui-jin-kuai-chu-li'))
      }
    })
    .catch((error) => {
      toast.error(t('t.ju-bao-shi-bai') + error.msg)
    })
}

/** 帖子点赞 */
export const likePost = (t: any, postId: number, close?: () => void) => {
  if (!userStore.isLogin) {
    toast.error(t('t.qing-xian-deng-lu'))
    return
  }
  postApi
    .postLike(postId)
    .then(() => {
      if (close) close()
      toast.success(t('t.cao-zuo-cheng-gong'))
    })
    .catch((error) => {
      console.error('Error liking post:', error)
    })
}

/** 帖子点踩 */
export const badPost = (t: any, postId: number, close?: () => void) => {
  if (!userStore.isLogin) {
    toast.error(t('t.qing-xian-deng-lu'))
    return
  }
  postApi
    .postBad(postId)
    .then(() => {
      if (close) close()
      toast.success(t('t.cao-zuo-cheng-gong'))
    })
    .catch((error) => {
      console.error('Error liking post:', error)
    })
}
