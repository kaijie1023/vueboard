<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useBoards } from "@/stores/boards";

const route = useRoute();
const boards = useBoards();
const board = computed(() =>
  boards.boards.find((b) => b.id === route.params.boardId)
);
</script>

<template>
  <div v-if="board">
    <h2 class="text-lg font-semibold mb-4">{{ board.name }}</h2>
    <ul class="grid gap-2">
      <li v-for="t in board.tasks" :key="t.id" class="flex items-center gap-2">
        <input type="checkbox" v-model="t.done" @change="$pinia.use" />
        <span :class="{ 'line-through opacity-60': t.done }">{{
          t.title
        }}</span>
      </li>
    </ul>
  </div>
  <div v-else>Board not found.</div>
</template>
