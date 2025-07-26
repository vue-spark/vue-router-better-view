import type {
  AllowedComponentProps,
  ComponentCustomProps,
  ShallowRef,
  VNode,
  VNodeProps,
} from 'vue'
import type {
  RouteComponent,
  RouteLocationMatched,
  RouteLocationNormalizedLoaded,
  RouteLocationNormalizedLoadedGeneric,
  RouterViewProps,
} from 'vue-router'
import { computed, defineComponent, getCurrentInstance, h, shallowRef } from 'vue'
import { RouterView } from 'vue-router'
import { useExactView } from './hooks/use-exact-view'
import { getWrappers } from './wrappers'

export interface SlotData {
  route: RouteLocationNormalizedLoadedGeneric
  Component: VNode
}

export type ResolveViewKey = (
  route: RouteLocationNormalizedLoaded,
) => string | void | undefined | null

export type ExactFn = (matchedRoute: RouteLocationMatched) => boolean

export interface BetterRouterViewProps extends RouterViewProps {
  resolveViewKey?: ResolveViewKey
  exact?: boolean | number | null
}

const BetterRouterViewImpl = /* #__PURE__ */ defineComponent({
  name: 'BetterRouterView',
  inheritAttrs: false,
  props: {
    resolveViewKey: {
      type: Function,
    },
    exact: {
      type: [Boolean, Number, null],
      default: null,
    },
  },
  setup(props, { attrs, slots }) {
    const app = getCurrentInstance()!.appContext.app
    const wrappers = getWrappers(app)

    function createViewWrapper({ route, Component: viewComponent }: SlotData): RouteComponent {
      const name = props.resolveViewKey?.(route)
      if (!name) {
        return viewComponent
      }

      if (!wrappers.has(name)) {
        wrappers.set(
          name,
          defineComponent({
            name,
            inheritAttrs: false,
            setup(_, { attrs, slots, expose }) {
              const inner$: ShallowRef<any> = shallowRef()
              expose(
                new Proxy(
                  {},
                  {
                    get: (t, p) => Reflect.get(inner$.value || t, p),
                    has: (t, p) => Reflect.get(inner$.value || t, p),
                  },
                ),
              )
              return () => h(viewComponent, { ...attrs, ref: inner$ }, slots)
            },
          }),
        )
      }
      return wrappers.get(name)!
    }

    useExactView({
      exact: computed(() => props.exact),
    })

    return () =>
      h(RouterView, attrs, {
        default: (data: Omit<SlotData, 'Component'> & { Component?: VNode }) => {
          const slot = slots.default
          if (data.Component) {
            data.Component = h(createViewWrapper(data as SlotData))
          }
          if (slot) {
            return slot(data)
          }
          return data.Component
        },
      })
  },
})

export const BetterRouterView = BetterRouterViewImpl as new () => {
  $props: AllowedComponentProps & ComponentCustomProps & VNodeProps & BetterRouterViewProps
  $slots: {
    default?: (data: SlotData) => VNode[]
  }
}
