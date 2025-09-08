import { computed, reactive } from "vue";

export function useForm<T extends Record<string, any>>(
  initial: T,
  rules: Partial<Record<keyof T, (v: any) => string | null>>
) {
  const model = reactive({ ...initial }) as T;
  const errors = reactive<Record<string, string | null>>({});

  function validateField(k: keyof T) {
    const rule = rules[k];
    errors[k as string] = rule ? rule(model[k]) : null;
  }

  function validateAll() {
    Object.keys(rules).forEach((k) => validateField(k as keyof T));
    return Object.values(errors).every((e) => !e);
  }

  const isValid = computed(() => Object.values(errors).every((e) => !e));

  return { model, errors, validateField, validateAll, isValid };
}
