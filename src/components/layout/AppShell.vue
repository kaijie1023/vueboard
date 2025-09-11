<script setup lang="ts">
import { inject } from "vue";
import Sidebar from "./Sidebar.vue";
const theme = inject<"light" | "dark">("theme", "light");
const toggleTheme = inject<() => void>("toggleTheme");
</script>

<template>
  <div class="shell" :class="theme">
    <Sidebar />
    <main class="content">
      <header class="flex justify-between items-center p-4 border-b">
        <h1>VueBoard</h1>
        <button class="btn" @click="toggleTheme && toggleTheme()">
          Toggle theme
        </button>
      </header>
      <section class="p-4">
        <slot />
      </section>
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas: "side-nav content";
}
header {
  grid-area: header;
}
.content {
  background: var(--c-bg);
  grid-area: content;
  width: 100%;
}
.btn {
  padding: 0.4rem 0.8rem;
}
</style>
