<!-- TableHeader.vue -->
<script setup lang="ts">
import { cn } from '@/lib/utils';
defineProps<{ class?: any }>();
</script>
<template>
  <thead :class="cn('[&_tr]:border-b', $props.class)">
    <slot />
  </thead>
</template>

<!-- TableBody.vue -->
<script setup lang="ts">
import { cn } from '@/lib/utils';
defineProps<{ class?: any }>();
</script>
<template>
  <tbody :class="cn('[&_tr:last-child]:border-0', $props.class)">
    <slot />
  </tbody>
</template>

<!-- TableRow.vue -->
<script setup lang="ts">
import { cn } from '@/lib/utils';
defineProps<{ class?: any }>();
</script>
<template>
  <tr :class="cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted font-medium', $props.class)">
    <slot />
  </tr>
</template>

<!-- TableHead.vue -->
<script setup lang="ts">
import { cn } from '@/lib/utils';
defineProps<{ class?: any }>();
</script>
<template>
  <th :class="cn('h-12 px-4 text-left align-middle font-semibold text-muted-foreground [&:has([role=checkbox])]:pr-0', $props.class)">
    <slot />
  </th>
</template>

<!-- TableCell.vue -->
<script setup lang="ts">
import { cn } from '@/lib/utils';
defineProps<{ class?: any }>();
</script>
<template>
  <td :class="cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', $props.class)">
    <slot />
  </td>
</template>
