<script setup lang="ts">
import { Card, CardContent } from './ui';

interface Props {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

defineProps<Props>();
</script>

<template>
  <Card class="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-300">
    <CardContent class="p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">{{ title }}</p>
          <h3 class="text-2xl font-bold mt-1 tracking-tight">{{ value }}</h3>
          <p v-if="description" class="text-xs text-muted-foreground mt-1">
            {{ description }}
          </p>
          <div v-if="trend" class="flex items-center mt-2 text-xs" :class="trend.positive ? 'text-emerald-600' : 'text-rose-600'">
            <span class="font-medium">{{ trend.value }}</span>
            <span class="ml-1 text-muted-foreground">vs mois dernier</span>
          </div>
        </div>
        <div class="p-3 bg-amber-50 rounded-xl">
          <component :is="icon" class="h-6 w-6 text-amber-600" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>
