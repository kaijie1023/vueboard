<script setup lang="ts">
import type { Board } from "@/stores/boards";
const props = defineProps<{ board: Board }>();
</script>

<template>
  <router-link
    class="block p-3 border rounded-lg hover:bg-black/5"
    :to="{ name: 'board', params: { boardId: props.board.id } }"
  >
    <div class="font-medium">{{ props.board.name }}</div>
    <div class="text-sm opacity-70">{{ props.board.tasks.length }} tasks</div>
  </router-link>
</template>
