import { createRouter, createWebHistory } from 'vue-router'
import List2 from '@/views/List2.vue'
import List from '@/views/List.vue'
import ListDetail from '@/views/ListDetail.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layout/index.vue'),
      redirect: '/list',
      children: [
        {
          path: '/list',
          component: List,
          meta: {
            keepAlive: true,
          },
          children: [
            {
              path: 'detail/:viewKey',
              component: ListDetail,
              meta: {
                keepAlive: true,
              },
            },
          ],
        },

        {
          path: '/list2',
          component: List2,
          meta: {
            keepAlive: true,
          },
          children: [
            {
              path: 'detail/:viewKey',
              component: ListDetail,
              meta: {
                keepAlive: true,
                singleton: true,
              },
            },
          ],
        },
      ],
    },
  ],
})

export default router
