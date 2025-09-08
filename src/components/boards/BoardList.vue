<script setup lang="ts">
import { ref } from "vue";
import { useBoards } from "@/stores/boards";
import BoardItem from "./BoardItem.vue";

const boards = useBoards();
const name = ref("");
async function add() {
  if (!name.value) return;
  await boards.addBoard(name.value);
  name.value = "";
}
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
.list-enter-active,
.list-leave-active {
  transition: all 0.18s;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
.input {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--c-border);
  border-radius: 0.5rem;
}
.btn {
  padding: 0.4rem 0.8rem;
}
</style>
