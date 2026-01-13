<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'gold';
  class?: any;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
});

const variants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'text-foreground border border-input hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
  gold: 'bg-amber-100 text-amber-700 border border-amber-200'
};
</script>

<template>
  <div :class="cn(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    variants[props.variant],
    props.class
  )">
    <slot />
  </div>
</template>
