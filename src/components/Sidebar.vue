<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut 
} from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const authStore = useAuthStore();

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Membres', href: '/members', icon: Users },
  { name: 'Rapports', href: '/reports', icon: FileText },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];
</script>

<template>
  <div class="flex h-full w-full flex-col bg-white">
    <div class="flex h-16 shrink-0 items-center px-6 border-b border-gray-100">
      <span class="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
        Gère ma Dîme
      </span>
    </div>
    <nav class="flex flex-1 flex-col p-4 space-y-1">
      <RouterLink
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        :class="cn(
          'group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold transition-all duration-200',
          route.path.startsWith(item.href)
            ? 'bg-amber-50 text-amber-700 shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )"
      >
        <component 
          :is="item.icon" 
          :class="cn(
            'h-5 w-5 shrink-0',
            route.path.startsWith(item.href) ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-500'
          )" 
        />
        {{ item.name }}
      </RouterLink>
    </nav>
    <div class="p-4 border-t border-gray-100">
      <button
        @click="authStore.logout()"
        class="group flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
      >
        <LogOut class="h-5 w-5 shrink-0 text-gray-400 group-hover:text-red-500" />
        Déconnexion
      </button>
    </div>
  </div>
</template>
