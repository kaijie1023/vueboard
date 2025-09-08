import { ref, watchEffect } from "vue";

const theme = ref<"light" | "dark">(
  (localStorage.getItem("theme") as any) || "light"
);
watchEffect(() => {
  localStorage.setItem("theme", theme.value);
  document.documentElement.classList.toggle("dark", theme.value === "dark");
});
export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === "light" ? "dark" : "light";
  }
  return { theme, toggleTheme };
}
