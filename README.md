# vue-router-better-view

An extension for [Vue Router](https://router.vuejs.org/)'s [RouterView](https://router.vuejs.org/guide/advanced/router-view-slot.html#RouterView-slot) with enhanced features.

**Key Features**

- [x] Enhanced [RouterView & KeepAlive](https://router.vuejs.org/guide/advanced/router-view-slot.html#KeepAlive-Transition) functionality with support for dynamic parameter route caching
- [x] Precise rendering (ignore parent routes with components) for intuitive nested route handling

[中文文档](./README.zh-CN.md) | [Online Demo](https://l246804.github.io/vue-router-better-view/)

---

## Background

Current issues with Vue Router:

### 1. **Dynamic Route Caching Problems**

- **Issue 1**: When using `KeepAlive`, cannot precisely control component instance caching for dynamic routes (e.g., `/user/:id`)
- **Issue 2**: Route component `name` must match route configuration's `name` attribute for proper caching

### 2. **Nested Route Rendering Issues**

- **Issue 1**: Official nested routes require either nested `RouterView` or flat route registration, leading to:
  - **Nested RouterView approach**: Redundant rendering logic in sub-pages
  - **Flat registration**: Loses `route.matched` convenience and feels unintuitive

This plugin solves these issues through the `BetterRouterView` component with a more efficient solution.

---

## Installation

```bash
npm i vue-router-better-view
```

### Global Registration

```ts
import { BetterRouterView } from 'vue-router-better-view'

// Globally register BetterRouterView component
app.use(BetterRouterView)
```

### Local Registration

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

## Core Features

### 1. **Dynamic Route Caching Optimization**

#### Problem

By default, `/user/1` and `/user/2` are treated as same component, preventing fine-grained caching control.

#### Solution

Custom cache identifier via `resolveViewKey`:

```html
<script
  setup
  lang="ts"
>
  import { BetterRouterView, type ResolveViewKey } from 'vue-router-better-view'

  const resolveViewKey: ResolveViewKey = (route) => {
    // Cache by path if marked as singleton
    if (route.meta.singleton) return route.path
    // Cache by fullPath (including params) otherwise
    return route.fullPath
  }
</script>

<template>
  <main>
    <better-router-view
      v-slot="{ Component }"
      :resolve-view-key="resolveViewKey"
    >
      <!-- Include/exclude based on resolveViewKey value -->
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </better-router-view>
  </main>
</template>
```

---

### 2. **Precise Nested Route Rendering**

#### Use Case

Directly render `<UserDetail />` for `/system/user/detail` instead of parent component `<User />`

#### Configuration Example

```ts
// src/router/index.ts
const routes: RouteRecordRaw[] = [
  {
    path: '/system',
    component: Layout, // Layout component requiring precise rendering
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

#### Implementation Methods

- **Using `<BetterRouterView />`**:

  ```html
  <script
    setup
    lang="ts"
  >
    import { BetterRouterView } from 'vue-router-better-view'
  </script>

  <template>
    <main>
      <!-- Enable precise rendering with 'exact' attribute -->
      <better-router-view exact />
    </main>
  </template>
  ```

- **Using `useExactView` Function**:

> Must be called in the component containing `<RouterView />`

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
    <!-- Can use native RouterView component -->
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
   * Gets view component identifier for current route
   * - When unset or returns falsy value, behaves like standard RouterView
   * @param route Current route
   * @returns View component identifier
   */
  resolveViewKey?: ResolveViewKey
  /**
   * Whether to enable precise route matching
   * - boolean: `true` enables precise matching but disallows nested RouterView
   * - number: Enables precise matching with nested RouterView support
   * - null: Default, restores standard RouterView behavior
   * @default null
   */
  exact?: boolean | number | null
}
```

---

## Migration Guide

### Upgrading to v1.0.0

- Fully compatible with standard `<RouterView>` usage
- Ensure `exact` attribute is enabled in nested route configurations

---

## Sponsor

Your support fuels continuous improvement! If this project helps you, consider buying me a juice 🍹:

| WeChat                                  | Alipay                                   |
| --------------------------------------- | ---------------------------------------- |
| <img src="./public/wx.jpg" width="200"> | <img src="./public/zfb.jpg" width="200"> |
