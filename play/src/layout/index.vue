<script setup lang="ts">
import type { PlusRouteRecordRaw } from 'plus-pro-components'
import type { RouteCacheBy } from 'vue-router-better-view'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import Logo from '@/assets/logo.svg'
import { keepAliveValues } from '@/stores/keepAlive'

const cacheBy: RouteCacheBy = (route) => {
  if (route.meta.keepAlive) {
    return route.meta.singleton ? route.path : route.fullPath
  }
}

const routes: PlusRouteRecordRaw[] = [
  {
    path: '/list',
    meta: {
      title: 'by route.fullPath',
    },
  },
  {
    path: '/list2',
    meta: {
      title: 'by route.path',
    },
  },
]

const route = useRoute()
watch(
  () => route.fullPath,
  () => {
    if (route.meta.keepAlive) {
      keepAliveValues.add(route.meta.singleton ? route.path : route.fullPath)
    }
  },
  { immediate: true },
)
</script>

<template>
  <PlusLayout
    :has-breadcrumb="false"
    :header-props="{ title: 'VueRouterBetterView', logo: Logo, hasUserInfo: false }"
    :sidebar-props="{ routes }"
  >
    <BetterRouterView
      v-slot="{ Component: viewComponent }"
      :cache-by="cacheBy"
      exact
    >
      <KeepAlive :include="[...keepAliveValues]">
        <Component
          :is="viewComponent"
          :key="route.fullPath"
        />
      </KeepAlive>
    </BetterRouterView>
  </PlusLayout>
</template>
