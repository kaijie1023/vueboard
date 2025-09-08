import * as api from "@/services/api";
import { defineStore } from "pinia";
import { ref } from "vue";

export type Task = { id: string; title: string; done: boolean };
export type Board = { id: string; name: string; tasks: Task[] };

export const useBoards = defineStore("boards", () => {
  const boards = ref<Board[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchBoards() {
    loading.value = true;
    try {
      boards.value = await api.getBoards();
    } catch (e: any) {
      error.value = e?.message ?? "Failed to load";
    } finally {
      loading.value = false;
    }
  }

  async function addBoard(name: string) {
    const optimistic: Board = { id: crypto.randomUUID(), name, tasks: [] };
    boards.value.push(optimistic);
    try {
      await api.createBoard(optimistic);
    } catch (e) {
      boards.value = boards.value.filter((b) => b.id !== optimistic.id);
      throw e;
    }
  }

  async function toggleTask(boardId: string, taskId: string) {
    const b = boards.value.find((b) => b.id === boardId);
    if (!b) return;
    const t = b.tasks.find((t) => t.id === taskId);
    if (!t) return;
    t.done = !t.done;
    try {
      await api.updateTask(boardId, { ...t });
    } catch (e) {
      t.done = !t.done;
    }
  }

  return { boards, loading, error, fetchBoards, addBoard, toggleTask };
});
