import AppShell from "@/components/layout/AppShell.vue";
import { useAuth } from "@/stores/auth";
import { createRouter, createWebHistory } from "vue-router";

const DashboardView = () => import("@/views/DashboardView.vue");
const LoginView = () => import("@/views/LoginView.vue");
const BoardView = () => import("@/views/BoardView.vue");
const SettingsView = () => import("@/views/SettingsView.vue");
const ErrorView = () => import("@/views/ErrorView.vue");

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { public: true },
    },
    {
      path: "/",
      component: AppShell,
      children: [
        { path: "", name: "dashboard", component: DashboardView },
        {
          path: "/board/:boardId",
          name: "board",
          component: BoardView,
          props: true,
        },
      ],
    },

    { path: "/settings", name: "settings", component: SettingsView },
    {
      path: "/:pathMatch(.*)*",
      name: "error",
      component: ErrorView,
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuth();
  if (!to.meta.public && !auth.isAuthenticated) return { name: "login" };
  if (to.name === "login" && auth.isAuthenticated) {
    return { name: "dashboard" };
  }
  return true;
});

export default router;
