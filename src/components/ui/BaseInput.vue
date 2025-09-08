<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{
  modelValue: string;
  label?: string;
  error?: string | null;
}>();
const emit = defineEmits<{ (e: "update:modelValue", v: string): void }>();
const id = computed(() => `in-${Math.random().toString(36).slice(2)}`);
</script>

<template>
  <label :for="id" class="block text-sm font-medium">{{ label }}</label>
  <input
    :id="id"
    class="input"
    :value="modelValue"
    @input="
      emit('update:modelValue', ($event.target as HTMLInputElement).value)
    "
  />
  <p v-if="error" class="text-red-600 text-xs mt-1">{{ error }}</p>
</template>

<style scoped>
.input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--c-border);
  border-radius: 0.5rem;
  width: 100%;
}
</style>
