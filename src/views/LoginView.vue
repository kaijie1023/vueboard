<script setup lang="ts">
import { useForm } from "@/composables/useForm";
import BaseInput from "@/components/ui/BaseInput.vue";
import { useAuth } from "@/stores/auth";
// import { vFocus } from "@/directives/focus";

const auth = useAuth();
const { model, errors, validateField, validateAll } = useForm(
  { username: "", password: "" },
  {
    username: (v) => (v ? null : "Username required"),
    password: (v) => (v.length >= 4 ? null : "Min 4 chars"),
  }
);

function submit() {
  if (validateAll()) auth.login(model.username, model.password);
}
</script>

<template>
  <div class="mx-auto max-w-sm p-6">
    <h2 class="text-xl font-semibold mb-4">Sign in</h2>
    <BaseInput
      v-focus
      v-model="model.username"
      label="Username"
      :error="errors.username"
      @blur="validateField('username')"
    />
    <BaseInput
      v-model="model.password"
      label="Password"
      :error="errors.password"
      @blur="validateField('password')"
    />
    <button class="btn w-full mt-3" @click="submit">Login</button>
  </div>
</template>
