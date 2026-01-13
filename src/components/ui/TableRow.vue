<script setup lang="ts">
import { cn } from '@/lib/utils';
defineProps<{ class?: any }>();
</script>
<template>
  <tr :class="cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted font-medium', $props.class)">
    <slot />
  </tr>
</template>
