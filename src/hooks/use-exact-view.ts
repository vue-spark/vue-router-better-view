import type { MaybeRefOrGetter, Reactive } from 'vue'
import { computed, inject, provide, toValue } from 'vue'
import { useRoute, viewDepthKey } from 'vue-router'
import { isBoolean } from '../utils'

export interface UseExactViewOptions {
  /**
   * 是否精准匹配当前路由的视图组件，必须在包含 `<RouterView>` 的所属组件 `setup()` 内调用
   * - boolean: 设为 `true` 时将精准匹配当前路由的视图组件，但在调用该函数的组件下所有视图组件将**无法再嵌套** `<RouterView>`！
   * - number: 设置为数字时，将精准匹配对应路由的视图组件，且在调用该函数的组件下所有视图组件**支持再嵌套** `<RouterView>`！
   * - null: 默认值，将还原 `<RouterView>` 渲染逻辑
   */
  exact: MaybeRefOrGetter<boolean | number | null>
}

export function useExactView(options: UseExactViewOptions | Reactive<UseExactViewOptions>): void {
  const route = useRoute()
  const viewDepth = inject(viewDepthKey, 0)
  provide(
    viewDepthKey,
    computed(() => {
      const exactValue = toValue(options.exact)
      const viewDepthValue = toValue(viewDepth)

      if (exactValue == null) {
        return viewDepthValue
      }

      if (isBoolean(exactValue)) {
        return exactValue ? route.matched.length - 1 : viewDepthValue
      }

      return route.matched[exactValue] ? exactValue : viewDepthValue
    }),
  )
}
