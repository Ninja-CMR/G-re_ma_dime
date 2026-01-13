<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  modelValue: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  class?: any;
}

defineProps<Props>();
const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <select
    :value="modelValue"
    @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    :class="cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url(\'data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M7%207l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E\')] bg-[length:20px] bg-no-repeat bg-[right_8px_center]',
      $props.class
    )"
  >
    <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>
