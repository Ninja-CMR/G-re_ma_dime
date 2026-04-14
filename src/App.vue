<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useMemberStore } from '@/stores/memberStore'
import { useTitheStore } from '@/stores/titheStore'

const memberStore = useMemberStore()
const titheStore = useTitheStore()

onMounted(async () => {
  await memberStore.fetchMembers()
  await titheStore.fetchTithes()
})
</script>

<template>
  <RouterView />
</template>
