<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './Sidebar.vue';
import { Menu, X } from 'lucide-vue-next';
import { Button } from './ui';

const isSidebarOpen = ref(false);
const route = useRoute();

// Close sidebar on route change (mobile)
watch(() => route.path, () => {
    isSidebarOpen.value = false;
});
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <!-- Mobile Sidebar Overly -->
    <div 
      v-if="isSidebarOpen"
      @click="isSidebarOpen = false"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
    ></div>

    <!-- Sidebar Container -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <Sidebar />
      <!-- Close button for mobile -->
      <button 
        @click="isSidebarOpen = false"
        class="absolute top-4 right-[-40px] p-2 bg-white rounded-r-md lg:hidden shadow-md text-gray-500"
      >
        <X class="h-5 w-5" />
      </button>
    </aside>

    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Mobile Header -->
      <header class="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden shrink-0">
        <span class="text-lg font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
          Gère ma Dîme
        </span>
        <Button variant="ghost" size="icon" @click="isSidebarOpen = true">
          <Menu class="h-6 w-6" />
        </Button>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="mx-auto max-w-7xl">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

