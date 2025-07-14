import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/protocol',
    name: 'Protocol',
    component: () => import('@/views/Protocol.vue'),
    meta: {
      title: 'OSI/TCP-IP 协议模拟器'
    }
  },
  {
    path: '/pcap',
    name: 'Pcap',
    component: () => import('@/views/Pcap.vue'),
    meta: {
      title: 'PCAP 文件分析'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: {
      title: '关于'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 网络协议探险家`
  }
  
  next()
})

export default router
