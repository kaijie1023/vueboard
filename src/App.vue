<script setup lang="ts">
import { useTheme } from "@/composables/useTheme";
import { provide, ref } from "vue";

const { theme, toggleTheme } = useTheme();
provide("theme", theme); // provide/inject example
provide("toggleTheme", toggleTheme);

const ready = ref(true);
</script>

<template>
  <div :data-theme="theme">
    <!-- Global portals -->
    <!-- <teleport to="body">
      <div id="portal-root"></div>
    </teleport> -->

    <Suspense>
      <template #default>
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </template>
      <template #fallback>
        <div class="p-8 text-center">Loading app…</div>
      </template>
    </Suspense>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
