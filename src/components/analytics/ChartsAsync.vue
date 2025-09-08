<script setup lang="ts">
const data = await new Promise<number[]>((r) =>
  setTimeout(() => r([5, 3, 6, 2, 8]), 500)
);
</script>

<template>
  <div class="p-4 border rounded-lg">
    <p class="mb-2">Simple chart data (async): {{ data.join(", ") }}</p>
    <!-- Replace with a real chart lib if desired -->
  </div>
</template>
