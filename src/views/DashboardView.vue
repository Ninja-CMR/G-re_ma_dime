<script setup lang="ts">
import { ref } from 'vue';
import DashboardLayout from '@/components/DashboardLayout.vue';
import StatCard from '@/components/StatCard.vue';
import EvolutionChart from '@/components/EvolutionChart.vue';
import { useTitheStore } from '@/stores/titheStore';
import { Banknote, Users, Gem, FileDown, TrendingUp } from 'lucide-vue-next';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';

const titheStore = useTitheStore();
const chartComponentRef = ref<any>(null);

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
          title="Tribu la plus généreuse"
          :value="titheStore.mostGenerousTribe"
          :icon="Gem"
          description="Basé sur les versements totaux"
        />
      </div>

      <!-- Chart Section -->
      <Card class="border-none shadow-sm">
        <CardHeader class="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-7">
          <div>
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <TrendingUp class="h-5 w-5 text-amber-600" />
              Évolution des versements
            </h3>
            <p class="text-sm text-muted-foreground mt-1">Progression quotidienne des dîmes ce mois-ci</p>
          </div>
          <Button variant="outline" size="sm" @click="handleExportPDF" class="flex items-center gap-2 w-full sm:w-auto justify-center">
            <FileDown class="h-4 w-4" />
            Exporter en PDF
          </Button>
        </CardHeader>
        <CardContent>
          <div class="pt-2">
            <EvolutionChart ref="chartComponentRef" :data="titheStore.dailyEvolutionData" />
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
