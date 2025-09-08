<script setup lang="ts">
import { onMounted } from "vue";
import { useBoards } from "@/stores/boards";
import BoardList from "@/components/boards/BoardList.vue";
import ChartsAsync from "@/components/analytics/ChartsAsync.vue";

const boards = useBoards();

onMounted(() => boards.fetchBoards());
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
