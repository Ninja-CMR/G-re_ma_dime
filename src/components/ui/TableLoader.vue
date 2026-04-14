<script setup lang="ts">
import Skeleton from './Skeleton.vue'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from './index'

interface TableLoaderProps {
  rows?: number
  columns?: number
}

withDefaults(defineProps<TableLoaderProps>(), {
  rows: 5,
  columns: 4
})
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow class="bg-gray-50/50">
        <TableHead v-for="i in columns" :key="`head-${i}`">
          <Skeleton class="h-4 w-24" />
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="i in rows" :key="`row-${i}`">
        <TableCell v-for="j in columns" :key="`cell-${i}-${j}`">
          <Skeleton class="h-4 w-full" />
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
