# VueBoard — A Comprehensive Vue 3 Tutorial App (Covers *Everything*)

A hands‑on tutorial project that touches **every major aspect of Vue 3**: Composition API, reactivity, components (props/emit/slots), provide/inject, custom directives, transitions, Teleport, Suspense/async components, forms & validation, routing (guards, nested routes, lazy loading), Pinia state, API calls, error handling, composables, i18n, accessibility, testing, performance, and deployment. Optional chapters extend to SSR (Nuxt), PWA, and E2E.

---

## 0) What We’re Building

**VueBoard** — a mini project management dashboard with:
- Auth (mocked): login/register, protected routes
- Boards & Projects: CRUD with optimistic UI
- Tasks & Subtasks: drag & drop, filters, search
- Analytics: charts (lazy‑loaded async component)
- Realtime-ish presence (mocked intervals), notifications (Teleport)
- Settings: theme (light/dark), i18n (en/ms), profile
- Offline cache (LocalStorage) + server sync (mock API)

### Vue features mapping
- **Reactivity**: `ref`, `reactive`, `computed`, `watch`, `watchEffect`
- **Components**: props/emit, scoped & named **slots**
- **Composables**: `useX` functions, dependency injection via **provide/inject**
- **Routing**: nested routes, dynamic params, **guards**, **lazy loading**
- **State (Pinia)**: stores, persistence, plugins
- **Async**: `Suspense`, async components, error boundaries
- **Directives**: custom `v-focus`, `v-permission`
- **Transitions**: route transitions, list transitions
- **Teleport**: global modal/notification portal
- **Forms**: `v-model`, custom form controls, validation
- **Internationalization**: basic i18n switcher
- **Testing**: unit (Vitest + Vue Test Utils)
- **Perf**: code-splitting, memoization, `defineProps/Emits`, `shallowRef`

---

## 1) Project Setup

```bash
# Using Vite + Vue 3 + TypeScript
npm create vite@latest vueboard -- --template vue-ts
cd vueboard
npm i
npm i pinia vue-router@4 @vueuse/core
npm i -D @types/node vitest jsdom @vue/test-utils@next @testing-library/vue
```

Enable Volar/TSC strictness (tsconfig.json tweaks encouraged for best DX).

---

## 2) App Structure

```
vueboard/
├─ src/
│  ├─ main.ts
│  ├─ App.vue
│  ├─ router/
│  │   └─ index.ts
│  ├─ stores/
│  │   ├─ auth.ts
│  │   └─ boards.ts
│  ├─ composables/
│  │   ├─ useApi.ts
│  │   ├─ useForm.ts
│  │   ├─ useI18nLite.ts
│  │   └─ useTheme.ts
│  ├─ directives/
│  │   ├─ focus.ts
│  │   └─ permission.ts
│  ├─ components/
│  │   ├─ ui/
│  │   │   ├─ BaseButton.vue
│  │   │   ├─ BaseInput.vue
│  │   │   ├─ Modal.vue     # Teleport + slots
│  │   │   └─ TransitionFade.vue
│  │   ├─ layout/
│  │   │   ├─ AppShell.vue
│  │   │   └─ Sidebar.vue
│  │   ├─ boards/
│  │   │   ├─ BoardList.vue
│  │   │   ├─ BoardItem.vue
│  │   │   └─ TaskList.vue  # list transitions
│  │   └─ analytics/
│  │       └─ ChartsAsync.vue # async + Suspense
│  ├─ views/
│  │   ├─ LoginView.vue
│  │   ├─ DashboardView.vue
│  │   ├─ BoardView.vue      # nested routes /:boardId
│  │   └─ SettingsView.vue
│  ├─ services/
│  │   └─ api.ts             # mock API (fetch-like)
│  ├─ styles/
│  │   ├─ main.css
│  │   └─ theme.css
│  ├─ i18n/
│  │   └─ messages.ts
│  └─ portals/
│      └─ notifications.html # Teleport target (optional)
└─ tests/
   ├─ components/BaseInput.test.ts
   └─ views/LoginView.test.ts
```

---

## 3) Bootstrap (main.ts, App.vue)

**src/main.ts**
```ts
import { createApp, h } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/main.css'

const pinia = createPinia()

createApp({
  render: () => h(App)
})
  .use(pinia)
  .use(router)
  .mount('#app')
```

**src/App.vue** (Teleport target + Suspense + provide)
```vue
<script setup lang="ts">
import { provide, ref } from 'vue'
import { useTheme } from '@/composables/useTheme'
import AppShell from '@/components/layout/AppShell.vue'

const { theme, toggleTheme } = useTheme()
provide('theme', theme) // provide/inject example
provide('toggleTheme', toggleTheme)

const ready = ref(true)
</script>

<template>
  <div :data-theme="theme">
    <!-- Global portals -->
    <teleport to="body">
      <div id="portal-root"></div>
    </teleport>

    <Suspense>
      <template #default>
        <RouterView v-slot="{ Component }">
          <AppShell>
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </AppShell>
        </RouterView>
      </template>
      <template #fallback>
        <div class="p-8 text-center">Loading app…</div>
      </template>
    </Suspense>
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
```

---

## 4) Router (nested, guards, lazy)

**src/router/index.ts**
```ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/stores/auth'

const DashboardView = () => import('@/views/DashboardView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const BoardView = () => import('@/views/BoardView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/board/:boardId', name: 'board', component: BoardView, props: true },
    { path: '/settings', name: 'settings', component: SettingsView },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach((to) => {
  const auth = useAuth()
  if (!to.meta.public && !auth.isAuthenticated) return { name: 'login' }
  return true
})

export default router
```

---

## 5) Pinia Stores (auth, boards)

**src/stores/auth.ts**
```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuth = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<{ id: string; name: string } | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function login(username: string, password: string) {
    // mock auth
    token.value = 'mock-token'
    user.value = { id: 'u1', name: username }
    localStorage.setItem('token', token.value)
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return { token, user, isAuthenticated, login, logout }
})
```

**src/stores/boards.ts** (optimistic updates)
```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/services/api'

export type Task = { id: string; title: string; done: boolean }
export type Board = { id: string; name: string; tasks: Task[] }

export const useBoards = defineStore('boards', () => {
  const boards = ref<Board[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBoards() {
    loading.value = true
    try { boards.value = await api.getBoards() }
    catch (e: any) { error.value = e?.message ?? 'Failed to load' }
    finally { loading.value = false }
  }

  async function addBoard(name: string) {
    const optimistic: Board = { id: crypto.randomUUID(), name, tasks: [] }
    boards.value.push(optimistic)
    try { await api.createBoard(optimistic) }
    catch (e) { boards.value = boards.value.filter(b => b.id !== optimistic.id); throw e }
  }

  async function toggleTask(boardId: string, taskId: string) {
    const b = boards.value.find(b => b.id === boardId)
    if (!b) return
    const t = b.tasks.find(t => t.id === taskId)
    if (!t) return
    t.done = !t.done
    try { await api.updateTask(boardId, { ...t }) } catch (e) { t.done = !t.done }
  }

  return { boards, loading, error, fetchBoards, addBoard, toggleTask }
})
```

---

## 6) Services & Composables

**src/services/api.ts** (mock API)
```ts
const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

let DB = {
  boards: [
    { id: 'b1', name: 'Product', tasks: [ { id: 't1', title: 'Spec', done: false } ] },
    { id: 'b2', name: 'Marketing', tasks: [ { id: 't2', title: 'Launch plan', done: true } ] }
  ]
}

export async function getBoards(){ await delay(300); return structuredClone(DB.boards) }
export async function createBoard(board:any){ await delay(300); DB.boards.push(board) }
export async function updateTask(boardId:string, task:any){ await delay(150); return true }
```

**src/composables/useApi.ts** (fetch helper with cancellation)
```ts
import { ref, onUnmounted } from 'vue'

export function useApi<T>(fn: () => Promise<T>) {
  const data = ref<T | null>(null)
  const error = ref<any>(null)
  const loading = ref(false)
  let cancelled = false

  async function run() {
    loading.value = true; error.value = null; cancelled = false
    try {
      const res = await fn()
      if (!cancelled) data.value = res
    } catch (e) { if (!cancelled) error.value = e }
    finally { if (!cancelled) loading.value = false }
  }

  onUnmounted(() => { cancelled = true })
  return { data, error, loading, run }
}
```

**src/composables/useForm.ts** (lightweight validation)
```ts
import { reactive, computed } from 'vue'

export function useForm<T extends Record<string, any>>(initial: T, rules: Partial<Record<keyof T, (v:any)=>string | null>>) {
  const model = reactive({ ...initial }) as T
  const errors = reactive<Record<string, string | null>>({})

  function validateField(k: keyof T) {
    const rule = rules[k]
    errors[k as string] = rule ? rule(model[k]) : null
  }

  function validateAll() {
    Object.keys(rules).forEach(k => validateField(k as keyof T))
    return Object.values(errors).every(e => !e)
  }

  const isValid = computed(() => Object.values(errors).every(e => !e))

  return { model, errors, validateField, validateAll, isValid }
}
```

**src/composables/useTheme.ts**
```ts
import { ref, watchEffect } from 'vue'

const theme = ref<'light' | 'dark'>((localStorage.getItem('theme') as any) || 'light')
watchEffect(() => localStorage.setItem('theme', theme.value))
export function useTheme(){
  function toggleTheme(){ theme.value = theme.value === 'light' ? 'dark' : 'light' }
  return { theme, toggleTheme }
}
```

**src/composables/useI18nLite.ts** (micro i18n)
```ts
import { ref, computed, provide, inject } from 'vue'
import messages from '@/i18n/messages'

const I18N_KEY = Symbol('i18n')

export function createI18n() {
  const locale = ref<'en'|'ms'>('en')
  const t = computed(() => (key: string) => messages[locale.value][key] ?? key)
  provide(I18N_KEY, { locale, t })
  return { locale, t }
}

export function useI18n(){
  const ctx = inject<{ locale:any; t:any }>(I18N_KEY)
  if (!ctx) throw new Error('i18n not provided')
  return ctx
}
```

---

## 7) Directives

**src/directives/focus.ts**
```ts
import type { Directive } from 'vue'
export const vFocus: Directive = {
  mounted(el) { el.focus() }
}
```

**src/directives/permission.ts**
```ts
import type { Directive } from 'vue'
export const vPermission: Directive = {
  mounted(el, binding) {
    const allowed = binding.value // boolean or role check
    if (!allowed) el.remove()
  }
}
```

Register globally (in a small plugin or directly in `main.ts`).

---

## 8) UI Components (slots, emits, transitions, Teleport)

**src/components/ui/BaseInput.vue**
```vue
<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ modelValue: string; label?: string; error?: string | null }>()
const emit = defineEmits<{ (e:'update:modelValue', v:string): void }>()
const id = computed(() => `in-${Math.random().toString(36).slice(2)}`)
</script>

<template>
  <label :for="id" class="block text-sm font-medium">{{ label }}</label>
  <input :id="id" class="input" :value="modelValue" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
  <p v-if="error" class="text-red-600 text-xs mt-1">{{ error }}</p>
</template>

<style scoped>
.input { padding:.5rem .75rem; border:1px solid var(--c-border); border-radius:.5rem; width:100%; }
</style>
```

**src/components/ui/Modal.vue** (Teleport + slots)
```vue
<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e:'close'): void }>()
</script>

<template>
  <teleport to="#portal-root">
    <transition name="fade">
      <div v-if="open" class="backdrop" @click.self="emit('close')">
        <div class="panel">
          <header class="px-4 py-3 border-b">
            <slot name="title">Modal</slot>
          </header>
          <section class="p-4">
            <slot />
          </section>
          <footer class="px-4 py-3 border-t text-right">
            <slot name="actions">
              <button class="btn" @click="emit('close')">Close</button>
            </slot>
          </footer>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.backdrop { position:fixed; inset:0; display:grid; place-items:center; background:rgba(0,0,0,.4) }
.panel { background:var(--c-bg); border-radius:1rem; min-width:320px; max-width:90vw; }
.btn { padding:.5rem 1rem; }
.fade-enter-active,.fade-leave-active{ transition: opacity .15s }
.fade-enter-from,.fade-leave-to{ opacity:0 }
</style>
```

**src/components/layout/AppShell.vue** (provide/inject usage)
```vue
<script setup lang="ts">
import { inject } from 'vue'
import Sidebar from './Sidebar.vue'
const theme = inject<'light'|'dark'>('theme', 'light')
const toggleTheme = inject<() => void>('toggleTheme')
</script>

<template>
  <div class="shell" :class="theme">
    <Sidebar />
    <main class="content">
      <header class="flex justify-between items-center p-4 border-b">
        <h1>VueBoard</h1>
        <button class="btn" @click="toggleTheme && toggleTheme()">Toggle theme</button>
      </header>
      <section class="p-4">
        <slot />
      </section>
    </main>
  </div>
</template>

<style scoped>
.shell { display:grid; grid-template-columns: 260px 1fr; min-height:100vh }
.content { background:var(--c-bg) }
.btn { padding:.4rem .8rem }
</style>
```

---

## 9) Views (forms, validation, guards, list transitions)

**src/views/LoginView.vue**
```vue
<script setup lang="ts">
import { useForm } from '@/composables/useForm'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useAuth } from '@/stores/auth'
import { vFocus } from '@/directives/focus'

const auth = useAuth()
const { model, errors, validateField, validateAll } = useForm({ username: '', password: '' }, {
  username: v => v ? null : 'Username required',
  password: v => v.length >= 4 ? null : 'Min 4 chars'
})

function submit(){ if (validateAll()) auth.login(model.username, model.password) }
</script>

<template>
  <div class="mx-auto max-w-sm p-6">
    <h2 class="text-xl font-semibold mb-4">Sign in</h2>
    <BaseInput v-focus v-model="model.username" label="Username" :error="errors.username" @blur="validateField('username')" />
    <BaseInput v-model="model.password" label="Password" :error="errors.password" @blur="validateField('password')" />
    <button class="btn w-full mt-3" @click="submit">Login</button>
  </div>
</template>
```

**src/views/DashboardView.vue**
```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useBoards } from '@/stores/boards'
import BoardList from '@/components/boards/BoardList.vue'
import ChartsAsync from '@/components/analytics/ChartsAsync.vue'

const boards = useBoards()

onMounted(() => boards.fetchBoards())
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">Your Boards</h2>
    <BoardList />

    <h3 class="mt-8 mb-2 font-semibold">Analytics</h3>
    <Suspense>
      <ChartsAsync />
      <template #fallback>
        <div>Loading charts…</div>
      </template>
    </Suspense>
  </div>
</template>
```

**src/components/boards/BoardList.vue** (list transitions + slots)
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useBoards } from '@/stores/boards'
import BoardItem from './BoardItem.vue'

const boards = useBoards()
const name = ref('')
async function add(){ if (!name.value) return; await boards.addBoard(name.value); name.value='' }
</script>

<template>
  <div>
    <div class="flex gap-2 mb-3">
      <input v-model="name" placeholder="New board name" class="input" />
      <button class="btn" @click="add">Add</button>
    </div>

    <TransitionGroup name="list" tag="ul" class="grid gap-2">
      <li v-for="b in boards.boards" :key="b.id">
        <BoardItem :board="b" />
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.list-enter-active,.list-leave-active{ transition: all .18s }
.list-enter-from{ opacity:0; transform: translateY(-4px) }
.list-leave-to{ opacity:0; transform: translateY(4px) }
.input { padding:.4rem .6rem; border:1px solid var(--c-border); border-radius:.5rem }
.btn { padding:.4rem .8rem }
</style>
```

**src/components/boards/BoardItem.vue** (emits)
```vue
<script setup lang="ts">
import type { Board } from '@/stores/boards'
const props = defineProps<{ board: Board }>()
</script>

<template>
  <router-link class="block p-3 border rounded-lg hover:bg-black/5" :to="{ name:'board', params:{ boardId: props.board.id } }">
    <div class="font-medium">{{ props.board.name }}</div>
    <div class="text-sm opacity-70">{{ props.board.tasks.length }} tasks</div>
  </router-link>
</template>
```

**src/views/BoardView.vue** (dynamic route + tasks)
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBoards } from '@/stores/boards'

const route = useRoute()
const boards = useBoards()
const board = computed(() => boards.boards.find(b => b.id === route.params.boardId))
</script>

<template>
  <div v-if="board">
    <h2 class="text-lg font-semibold mb-4">{{ board.name }}</h2>
    <ul class="grid gap-2">
      <li v-for="t in board.tasks" :key="t.id" class="flex items-center gap-2">
        <input type="checkbox" v-model="t.done" @change="$pinia.use" />
        <span :class="{ 'line-through opacity-60': t.done }">{{ t.title }}</span>
      </li>
    </ul>
  </div>
  <div v-else>Board not found.</div>
</template>
```

---

## 10) Async Component (Suspense)

**src/components/analytics/ChartsAsync.vue**
```vue
<script setup lang="ts">
const data = await new Promise<number[]>(r => setTimeout(() => r([5,3,6,2,8]), 500))
</script>

<template>
  <div class="p-4 border rounded-lg">
    <p class="mb-2">Simple chart data (async): {{ data.join(', ') }}</p>
    <!-- Replace with a real chart lib if desired -->
  </div>
</template>
```

---

## 11) i18n Lite

**src/i18n/messages.ts**
```ts
export default {
  en: { sign_in: 'Sign in', add: 'Add', boards: 'Boards' },
  ms: { sign_in: 'Log masuk', add: 'Tambah', boards: 'Papan' }
}
```

Use via `createI18n()` in a top-level layout or `App.vue`, then `const { t, locale } = useI18n()`.

---

## 12) Styling & Theming

**src/styles/main.css**
```css
:root{ --c-bg:#fff; --c-text:#111; --c-border:#ddd }
[data-theme="dark"]{ --c-bg:#0b0b0f; --c-text:#e6e6eb; --c-border:#2a2a33 }
*{ box-sizing:border-box } body{ margin:0; background:var(--c-bg); color:var(--c-text); font:14px/1.4 system-ui }
a{ color:inherit; text-decoration:none }
.border{ border:1px solid var(--c-border) }
.rounded-lg{ border-radius: .75rem }
```

---

## 13) Testing (Vitest + Vue Test Utils)

**tests/components/BaseInput.test.ts**
```ts
import { mount } from '@vue/test-utils'
import BaseInput from '@/components/ui/BaseInput.vue'

test('emits update on input', async () => {
  const wrapper = mount(BaseInput, { props: { modelValue: '' } })
  await wrapper.find('input').setValue('hello')
  expect(wrapper.emitted()['update:modelValue']?.[0]).toEqual(['hello'])
})
```

**tests/views/LoginView.test.ts**
```ts
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import LoginView from '@/views/LoginView.vue'

test('renders login form', () => {
  const wrapper = mount(LoginView, { global: { plugins: [createTestingPinia()] } })
  expect(wrapper.text()).toContain('Sign in')
})
```

Add Vitest config in `package.json` scripts: `"test": "vitest"`.

---

## 14) Permissions Directive in Action

Use `v-permission="userIsAdmin"` on destructive controls (delete board) to gate UI.

```vue
<button v-permission="isAdmin" class="btn-danger">Delete Board</button>
```

---

## 15) Performance Tips Demonstrated
- Prefer **lazy routes** & **async components** (already used)
- Use `computed` and **memoize** expensive derives
- Use `shallowRef` for non-reactive heavy objects (e.g., chart instances)
- Use `defineProps/defineEmits` w/ TS for tree‑shakable code
- Split large stores into **modules**; avoid giant reactive objects
- Debounce inputs with `@vueuse/core` (`useDebounceFn`)

---

## 16) Accessibility & UX
- Labels associated with inputs (`for`/`id`)
- Keyboard‑accessible modals (Esc to close, focus trap — exercise)
- High contrast in dark mode, avoid color‑only cues
- Announce route changes (aria‑live region — exercise)

---

## 17) Deployment
- **Static hosting** (Netlify/Vercel): `npm run build` → `dist/`
- Set SPA fallback to `index.html` for history mode routes.

---

## 18) Stretch Goals (Optional Chapters)
1. **SSR with Nuxt**: migrate views to pages, use server routes for APIs.
2. **PWA**: add service worker + manifest for offline.
3. **Drag & Drop**: implement with Pointer events; animate with `TransitionGroup`.
4. **Charts**: integrate Chart.js/ECharts as an async dependency.
5. **Auth**: replace mock with real OAuth/JWT.
6. **E2E**: Playwright or Cypress.

---

## 19) Learning Milestones Checklist
- [ ] Composition API fluency
- [ ] Props/Emits/Slots mastery
- [ ] Provide/Inject usage
- [ ] Router guards + nested routes
- [ ] Pinia with optimistic UI
- [ ] Custom directives
- [ ] Transitions + TransitionGroup
- [ ] Teleport for modals/notifications
- [ ] Suspense + async components
- [ ] Lightweight validation patterns
- [ ] Testing basics (Vitest + VTU)

---

## 20) Next Steps
- Scaffold the project with Vite, paste the files above, and iterate.
- Replace the mock API with your own backend (Spring Boot? Node? up to you).
- Ask for any chapter to be expanded — I can generate complete files or add features (PWA, drag & drop, charts, SSR).

