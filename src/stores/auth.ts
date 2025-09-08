import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuth = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("token"));
  const user = ref<{ id: string; name: string } | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  function login(username: string, password: string) {
    // mock auth
    token.value = "mock-token";
    user.value = { id: "u1", name: username };
    localStorage.setItem("token", token.value);
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
  }

  return { token, user, isAuthenticated, login, logout };
});
