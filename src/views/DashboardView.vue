<script setup lang="ts">
import { ref, computed } from 'vue';
import DashboardLayout from '@/components/DashboardLayout.vue';
import StatCard from '@/components/StatCard.vue';
import EvolutionChart from '@/components/EvolutionChart.vue';
import { useRouter } from 'vue-router';
import { useTitheStore } from '@/stores/titheStore';
import { useMemberStore } from '@/stores/memberStore';
import { Card, CardHeader, CardContent, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Input, Select, TableLoader } from '@/components/ui';
import { Search, Banknote, Users, Target, FileDown, TrendingUp, TrendingDown, ArrowRightCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next';

const titheStore = useTitheStore();
const memberStore = useMemberStore();
const chartComponentRef = ref<any>(null);
const statusFilter = ref('all');

const statusOptions = [
  { label: 'Tous les statuts', value: 'all' },
  { label: 'Objectif Atteint', value: 'reached' },
  { label: 'En attente / Incomplet', value: 'pending' }
];

const filteredStats = computed(() => {
  let stats = titheStore.membersYearlyStats;
  
  if (memberStore.searchQuery) {
    const query = memberStore.searchQuery.toLowerCase();
    stats = stats.filter(s => s.memberName.toLowerCase().includes(query));
  }
  
  if (statusFilter.value !== 'all') {
    stats = stats.filter(s => {
      // Check current month reaching target
      const now = new Date();
      const currentMonthIndex = now.getMonth();
      const currentMonthHistory = s.history[currentMonthIndex];
      const reached = currentMonthHistory?.reachedTarget || false;
      return statusFilter.value === 'reached' ? reached : !reached;
    });
  }
  
  return stats;
});

const paginatedStats = computed(() => {
  const start = (memberStore.currentPage - 1) * memberStore.itemsPerPage;
  const end = start + memberStore.itemsPerPage;
  return filteredStats.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredStats.value.length / memberStore.itemsPerPage));

const paginationRange = computed(() => {
  const start = (memberStore.currentPage - 1) * memberStore.itemsPerPage + 1;
  const end = Math.min(memberStore.currentPage * memberStore.itemsPerPage, filteredStats.value.length);
  return { start, end, total: filteredStats.value.length };
});

const itemsPerPageOptions = [
  { label: '5 par page', value: 5 },
  { label: '10 par page', value: 10 },
  { label: '20 par page', value: 20 },
  { label: '50 par page', value: 50 },
];

const itemsPerPageProxy = computed({
  get: () => memberStore.itemsPerPage.toString(),
  set: (val) => {
    memberStore.itemsPerPage = parseInt(val, 10);
  }
});

const globalAchievementRate = computed(() => {
  const totalTarget = memberStore.members.reduce((sum, m) => sum + m.monthlyTarget, 0);
  if (totalTarget === 0) return '0%';
  return `${Math.round((titheStore.totalTithesThisMonth / totalTarget) * 100)}%`;
});

const router = useRouter();

const goToProfile = (id: string) => {
  router.push(`/members/${id}`);
};

const monthLabels = computed(() => {
  const stats = titheStore.membersYearlyStats;
  if (stats && stats.length > 0 && stats[0]?.history) {
    return stats[0].history.map(h => h.month);
  }
  return [];
});

const globalChartData = computed(() => {
  const history = titheStore.globalYearlyStats.history;
  return {
    labels: history.map(h => h.month),
    datasets: [
      {
        label: 'Entrées Réelles (XAF)',
        data: history.map(h => h.entries),
        color: '#10b981', // emerald-500
        fill: true
      },
      {
        label: 'Cible Globale (XAF)',
        data: history.map(h => h.target),
        color: '#d97706', // amber-600
        borderDash: [5, 5]
      }
    ]
  };
});

const handleExportPDF = () => {
    if (chartComponentRef.value) {
        chartComponentRef.value.exportToPDF();
    }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(value);
};
</script>

<template>
  <DashboardLayout>
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 font-display">Tableau de bord</h1>
        <p class="text-muted-foreground mt-1">
          Bienvenue sur l'interface d'administration de Gère ma Dîme.
        </p>
      </div>

      <!-- KPIs -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total des Dîmes (Mois)"
          :value="formatCurrency(titheStore.totalTithesThisMonth)"
          :icon="Banknote"
          description="Estimé pour le mois en cours"
          :trend="{ value: '+12.5%', positive: true }"
        />
        <StatCard
          title="Membres Actifs"
          :value="titheStore.activeMembersCount"
          :icon="Users"
          description="Membres enregistrés"
        />
        <StatCard
          title="Taux d'atteinte"
          :value="globalAchievementRate"
          :icon="Target"
          description="Progression vers l'objectif global"
        />
      </div>

      <!-- Performance Table Section -->
      <Card class="border-none shadow-sm">
        <CardHeader>
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <Users class="h-5 w-5 text-amber-600" />
            Performance des Donateurs
          </h3>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <p class="text-sm text-muted-foreground">Suivi des objectifs mensuels par membre</p>
            <div class="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div class="relative w-full sm:w-64">
                <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  v-model="memberStore.searchQuery"
                  placeholder="Rechercher un membre..."
                  class="pl-9 h-9"
                />
              </div>
              <Select
                v-model="statusFilter"
                :options="statusOptions"
                class="w-full sm:w-48 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="overflow-x-auto">
            <Table class="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead class="sticky left-0 bg-white z-10 w-[150px]">Nom</TableHead>
                  <TableHead class="text-right w-[100px]">Cible (XAF)</TableHead>
                  <TableHead v-for="month in monthLabels" :key="month" class="text-center w-[60px]">{{ month }}</TableHead>
                  <TableHead class="text-right w-[110px]">Total (An)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow 
                  v-for="stats in paginatedStats" 
                  :key="stats.memberId"
                  @click="goToProfile(stats.memberId)"
                  class="cursor-pointer hover:bg-amber-50/50 transition-colors"
                >
                  <TableCell class="font-medium sticky left-0 bg-white z-10 border-r">{{ stats.memberName }}</TableCell>
                  <TableCell class="text-right text-muted-foreground font-medium">
                    {{ formatCurrency(stats.target).replace('FCFA', '') }}
                  </TableCell>
                  <TableCell v-for="(h, idx) in stats.history" :key="idx" class="text-center">
                    <div class="flex flex-col items-center gap-1 group relative">
                      <span :class="['text-sm font-bold', h.amount > 0 ? 'text-emerald-600' : 'text-gray-300']">
                        {{ h.amount > 0 ? formatCurrency(h.amount).replace('FCFA', '').trim() : '-' }}
                      </span>
                      <div v-if="h.amount > 0" class="flex items-center">
                        <TrendingUp v-if="h.reachedTarget" class="h-3 w-3 text-emerald-500" />
                        <TrendingDown v-else class="h-3 w-3 text-rose-400" />
                      </div>
                      <div v-else-if="stats.target > 0" class="h-3 w-3">
                         <ArrowRightCircle class="h-3 w-3 text-gray-200" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell class="text-right font-bold bg-amber-50/30">
                    {{ formatCurrency(stats.history.reduce((sum, h) => sum + h.amount, 0)) }}
                  </TableCell>
                </TableRow>
              </TableBody>
              <tfoot class="bg-gray-50/80 font-bold border-t-2 border-gray-200">
                <TableRow>
                  <TableCell class="sticky left-0 bg-gray-50 z-10 border-r">TOTAL CIBLES</TableCell>
                  <TableCell class="text-right text-amber-700">
                    {{ formatCurrency(titheStore.globalYearlyStats.totalTarget).replace('FCFA', '') }}
                  </TableCell>
                  <TableCell v-for="(h, idx) in titheStore.globalYearlyStats.history" :key="'target-'+idx" class="text-center text-amber-600 bg-amber-50/20">
                    {{ formatCurrency(h.target).replace('FCFA', '').trim() }}
                  </TableCell>
                  <TableCell class="text-right text-amber-800 bg-amber-100/30">
                    {{ formatCurrency(titheStore.globalYearlyStats.totalTarget * 12) }}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="sticky left-0 bg-gray-50 z-10 border-r text-emerald-700">TOTAL ENTRÉES</TableCell>
                  <TableCell class="text-right text-emerald-700">-</TableCell>
                  <TableCell v-for="(h, idx) in titheStore.globalYearlyStats.history" :key="'entries-'+idx" class="text-center text-emerald-600 bg-emerald-50/20">
                    {{ formatCurrency(h.entries).replace('FCFA', '').trim() }}
                  </TableCell>
                  <TableCell class="text-right text-emerald-800 bg-emerald-100/30">
                    {{ formatCurrency(titheStore.globalYearlyStats.history.reduce((sum, h) => sum + h.entries, 0)) }}
                  </TableCell>
                </TableRow>
              </tfoot>
            </Table>
          </div>

          <!-- Loading State -->
          <div v-if="titheStore.loading || memberStore.loading" class="p-6">
            <TableLoader :rows="memberStore.itemsPerPage" :columns="14" />
          </div>

          <!-- Pagination -->
          <div class="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 px-2">
            <div class="text-xs text-muted-foreground">
              Affichage de <span class="font-medium text-gray-900">{{ paginationRange.start }}</span> à 
              <span class="font-medium text-gray-900">{{ paginationRange.end }}</span> sur 
              <span class="font-medium text-gray-900">{{ paginationRange.total }}</span> membres
            </div>

            <div class="flex flex-col sm:flex-row items-center gap-4">
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500 whitespace-nowrap">Lignes par page:</span>
                <Select 
                  v-model="itemsPerPageProxy" 
                  :options="itemsPerPageOptions.map(o => ({ label: o.label, value: o.value.toString() }))" 
                  class="w-28 h-8 text-xs"
                />
              </div>

              <div class="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  class="h-8 w-8 p-0" 
                  :disabled="memberStore.currentPage === 1"
                  @click="memberStore.currentPage = 1"
                >
                  <ChevronsLeft class="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  class="h-8 w-8 p-0" 
                  :disabled="memberStore.currentPage === 1"
                  @click="memberStore.currentPage--"
                >
                  <ChevronLeft class="h-4 w-4" />
                </Button>
                
                <div class="flex items-center px-2 text-sm font-medium text-gray-700">
                  Page {{ memberStore.currentPage }} sur {{ totalPages }}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  class="h-8 w-8 p-0" 
                  :disabled="memberStore.currentPage === totalPages"
                  @click="memberStore.currentPage++"
                >
                  <ChevronRight class="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  class="h-8 w-8 p-0" 
                  :disabled="memberStore.currentPage === totalPages"
                  @click="memberStore.currentPage = totalPages"
                >
                  <ChevronsRight class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Evolution Chart Section -->
      <Card class="border-none shadow-sm">
        <CardHeader class="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-7">
          <div>
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <TrendingUp class="h-5 w-5 text-amber-600" />
              Progression Mensuelle Globale
            </h3>
            <p class="text-sm text-muted-foreground mt-1">Comparaison des entrées réelles par rapport à la cible globale</p>
          </div>
          <Button variant="outline" size="sm" @click="handleExportPDF" class="flex items-center gap-2 w-full sm:w-auto justify-center">
            <FileDown class="h-4 w-4" />
            Exporter en PDF
          </Button>
        </CardHeader>
        <CardContent>
          <div class="pt-2">
            <EvolutionChart 
              ref="chartComponentRef" 
              :labels="globalChartData.labels" 
              :datasets="globalChartData.datasets" 
            />
          </div>
        </CardContent>
      </Card>
      
      <!-- Recent Activity / Quick Actions could go here -->
    </div>
  </DashboardLayout>
</template>

<style scoped>
.font-display {
    font-family: 'Inter', sans-serif;
}
</style>
