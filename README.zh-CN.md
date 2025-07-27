# vue-router-better-view

为 [Vue Router](https://router.vuejs.org/) 的 [RouterView](https://router.vuejs.org/guide/advanced/router-view-slot.html#RouterView-slot) 扩展新特性。

**扩展特性**

- [x] 提升 [RouterView & KeepAlive](https://router.vuejs.org/zh/guide/advanced/router-view-slot.html#KeepAlive-Transition) 功能，支持动态参数路由精细化缓存
- [x] 支持精准渲染（忽略带有组件的父级路由），编写符合直觉的嵌套路由

[English Document](./README.md) | [在线示例](https://l246804.github.io/vue-router-better-view/)

---

## 背景

Vue Router 当前存在以下问题：

### 1. **动态路由缓存问题**

- **问题 1**: 使用 `KeepAlive` 时，无法精细化控制动态路由（如 `/user/:id`）组件实例缓存，也可以理解为路由组件复用问题。
- **问题 2**: 路由组件的 `name` 必须设置，且需要与路由的 `name` 属性一致，否则组件实例会缓存异常。

### 2. **嵌套路由渲染问题**

- **问题 1**: 官方支持的嵌套路由需使用嵌套 `RouterView` 或将父子级路由同级注册，导致：
  - **嵌套 `RouterView` 方案**：需在每个子页额外添加渲染逻辑，繁琐且重复。
  - **同级注册方案**：虽直观，但会丢失 `route.matched` 的便捷支持，且不符合直觉。

该插件通过 `BetterRouterView` 组件解决上述问题，提供更高效、简洁的解决方案。

---

## 安装

```bash
npm i vue-router-better-view
```

### 全局注册

```ts
import { BetterRouterView } from 'vue-router-better-view'

// 全局注册 BetterRouterView 组件
app.use(BetterRouterView)
```

### 局部注册

```html
<!-- layout.vue -->
<script
  setup
  lang="ts"
>
  import { BetterRouterView } from 'vue-router-better-view'
</script>

<template>
  <main>
    <better-router-view />
  </main>
</template>
```

---

## 核心功能

### 1. **动态路由缓存优化**

#### 问题

默认情况下，`/user/1` 和 `/user/2` 会被视为同一组件，导致无法精细化控制缓存实例。

#### 解决方案

通过 `resolveViewKey` 自定义缓存标识：

```html
<script
  setup
  lang="ts"
>
  import { BetterRouterView, type ResolveViewKey } from 'vue-router-better-view'

  const resolveViewKey: ResolveViewKey = (route) => {
    // 若路由标记为单例，则按 path 缓存
    if (route.meta.singleton) return route.path
    // 否则按 fullPath 缓存（包含参数）
    return route.fullPath
  }
</script>

<template>
  <main>
    <better-router-view
      v-slot="{ Component }"
      :resolve-view-key="resolveViewKey"
    >
      <!-- include、exclude 可以根据 resolveViewKey 的返回值进行缓存处理 -->
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </better-router-view>
  </main>
</template>
```

---

### 2. **精准渲染嵌套路由**

#### 场景

访问 `/system/user/detail` 时，期望直接渲染 `<UserDetail />`，而非父级组件 `<User />`。

#### 配置示例

```ts
// src/router/index.ts
const routes: RouteRecordRaw[] = [
  {
    path: '/system',
    component: Layout, // 布局组件，需启用精准渲染
    children: [
      {
        path: 'user',
        component: UserLayout,
        children: [
          {
            path: 'detail/:id?',
            component: UserDetail,
          },
        ],
      },
    ],
  },
]
```

#### 启用方式

- **使用 `<BetterRouterView />`**：

  ```html
  <script
    setup
    lang="ts"
  >
    import { BetterRouterView } from 'vue-router-better-view'
  </script>

  <template>
    <main>
      <!-- 增加 exact 属性，开启精准渲染 -->
      <better-router-view exact />
    </main>
  </template>
  ```

- **使用 `useExactView` 函数**：

> 使用该函数时必须要在包含 `<RouterView />` 的组件 `setup()` 中调用！

```html
<script
  setup
  lang="ts"
>
  import { useExactView } from 'vue-router-better-view'

  useExactView({ exact: true })
</script>

<template>
  <main>
    <!-- 这里可以使用原生的 RouterView 组件 -->
    <router-view />
  </main>
</template>
```

---

## API

### BetterRouterView

```ts
interface BetterRouterViewProps extends RouterViewProps {
  /**
   * 获取当前路由的视图组件标识，未设置或返回值为假值时与 `RouterView` 组件表现一致
   * @param route 当前路由
   * @returns 视图组件标识
   */
  resolveViewKey?: ResolveViewKey
  /**
   * 是否精准匹配当前路由的视图
   * - boolean: 设为 `true` 时将精准匹配当前路由的视图组件，但在调用该函数的组件下所有视图组件将**无法再嵌套** `<RouterView>`！
   * - number: 设置为数字时，将精准匹配对应路由的视图组件，且在调用该函数的组件下所有视图组件**支持再嵌套** `<RouterView>`！
   * - null: 默认值，将还原 `<RouterView>` 渲染逻辑
   * @default null
   */
  exact?: boolean | number | null
}
```

---

## 升级指南

### 升级到 v1.0.0

- 完全兼容 `<RouterView>` 用法，移除旧版模板引用逻辑。
- 确保嵌套路由配置中已启用精准渲染（`exact` 属性）。

---

## 赞助

您的支持是我持续改进的动力！如果该项目对您有帮助，可以考虑请作者喝杯果汁 🍹：

| 微信                                    | 支付宝                                   |
| --------------------------------------- | ---------------------------------------- |
| <img src="./public/wx.jpg" width="200"> | <img src="./public/zfb.jpg" width="200"> |
