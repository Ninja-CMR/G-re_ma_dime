<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  TrendingUp, 
  Users, 
  Banknote, 
  Download, 
  Calendar as CalendarIcon, 
  ChevronDown,
  FileDown,
  Gem
} from 'lucide-vue-next'
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  LineElement, 
  PointElement, 
  ArcElement, 
  Filler 
} from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'
import { jsPDF } from 'jspdf'
import DashboardLayout from '@/components/DashboardLayout.vue'
import StatCard from '@/components/StatCard.vue'
import EvolutionChart from '@/components/EvolutionChart.vue'
import { Card, CardContent, CardHeader, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { useTitheStore } from '@/stores/titheStore'
import { useMemberStore } from '@/stores/memberStore'

// Register Chart.js components
ChartJS.register(
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  LineElement, 
  PointElement, 
  ArcElement, 
  Filler
)

const titheStore = useTitheStore()
const memberStore = useMemberStore()

// Chart Refs for Export
const areaChartRef = ref<any>(null)
const donutChartRef = ref<any>(null)
const barChartRef = ref<any>(null)

const globalAchievementRate = computed(() => {
  const totalTarget = memberStore.members.reduce((sum, m) => sum + m.monthlyTarget, 0);
  if (totalTarget === 0) return '0%';
  return `${Math.round((titheStore.totalTithesThisMonth / totalTarget) * 100)}%`;
});

// Consistency with Dashboard Palette & EvolutionChart.vue
const colors = {
  amber: '#d97706', // amber-600
  amberLight: 'rgba(217, 119, 6, 0.1)',
  charcoal: '#374151', // gray-700
  white: '#FFFFFF',
  textSecondary: '#6b7280', // gray-500
  gridLines: '#f3f4f6',
  tooltipTitle: '#1f2937',
  tooltipBody: '#4b5563',
  tooltipBorder: '#e5e7eb',
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(value);
};

// Dynamic Age Pyramid Calculation
const ageGroups = computed(() => {
  const groups = [
    { range: '0-18', count: 0 },
    { range: '19-30', count: 0 },
    { range: '31-45', count: 0 },
    { range: '46-60', count: 0 },
    { range: '60+', count: 0 },
  ]
  
  memberStore.members.forEach(m => {
    const age = m.age;
    if (age <= 18) groups[0]!.count++
    else if (age <= 30) groups[1]!.count++
    else if (age <= 45) groups[2]!.count++
    else if (age <= 60) groups[3]!.count++
    else groups[4]!.count++
  })
  
  return groups
})

// Distribution of achievement levels
const achievementDistribution = computed(() => {
  const levels = [
    { label: '0-25%', count: 0 },
    { label: '26-50%', count: 0 },
    { label: '51-75%', count: 0 },
    { label: '76-100%', count: 0 },
  ];
  
  titheStore.membersYearlyStats.forEach(stats => {
    if (stats.percentage <= 25) levels[0]!.count++;
    else if (stats.percentage <= 50) levels[1]!.count++;
    else if (stats.percentage <= 75) levels[2]!.count++;
    else levels[3]!.count++;
  });
  
  return levels;
})

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

const donutChartData = computed(() => ({
  labels: achievementDistribution.value.map(l => l.label),
  datasets: [{
    data: achievementDistribution.value.map(l => l.count),
    backgroundColor: [
      '#ef4444', '#f59e0b', '#10b981', '#3b82f6'
    ],
    borderWidth: 1,
    borderColor: '#ffffff',
    hoverOffset: 12
  }]
}))

const barChartData = computed(() => ({
  labels: ageGroups.value.map(a => a.range),
  datasets: [{
    label: 'Nombre de membres',
    data: ageGroups.value.map(a => a.count),
    backgroundColor: colors.amber,
    borderRadius: 6,
    hoverBackgroundColor: '#b45309',
  }]
}))

// Chart Options
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 }, // Disable animation for faster capture if needed
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: colors.tooltipTitle,
      bodyColor: colors.tooltipBody,
      borderColor: colors.tooltipBorder,
      borderWidth: 1,
      padding: 12,
      displayColors: false,
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: colors.gridLines },
      ticks: { font: { size: 10 } }
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 10 } }
    }
  }
}

const donutOptions = {
  ...commonOptions,
  plugins: {
    ...commonOptions.plugins,
    legend: {
      display: true,
      position: 'right' as const,
      labels: { usePointStyle: true, padding: 15, font: { size: 11 } }
    }
  },
  cutout: '70%'
}

// REAL EXPORT LOGIC
const exportToPDF = async () => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  pdf.setFontSize(22);
  pdf.setTextColor(217, 119, 6); // amber-600
  pdf.text('Rapport Annuel - Gère ma Dîme', 20, yPos);
  
  yPos += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128); // gray-500
  pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, yPos);
  
  yPos += 15;
  
  // Summary Stats
  pdf.setFontSize(14);
  pdf.setTextColor(31, 41, 55); // gray-800
  pdf.text('Résumé des KPIs', 20, yPos);
  yPos += 8;
  pdf.setFontSize(11);
  pdf.text(`- Total Dîmes (Mois): ${formatCurrency(titheStore.totalTithesThisMonth)}`, 25, yPos);
  yPos += 6;
  pdf.text(`- Donateurs Actifs: ${titheStore.activeMembersCount}`, 25, yPos);
  yPos += 6;
  pdf.text(`- Taux d'atteinte Global: ${globalAchievementRate.value}`, 25, yPos);
  
  yPos += 15;

  // Function to add chart to PDF
  const addChartToPdf = (chartRef: any, title: string, height: number) => {
    if (chartRef?.chart) {
      const canvas = chartRef.chart.canvas;
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Check if we need a new page
      if (yPos + height > 280) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setTextColor(31, 41, 55);
      pdf.text(title, 20, yPos);
      yPos += 5;
      
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 20, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 15;
    }
  };

  addChartToPdf(areaChartRef.value, 'Évolution Annuelle des Versements', 80);
  addChartToPdf(donutChartRef.value, 'Atteinte des Objectifs', 80);
  addChartToPdf(barChartRef.value, 'Pyramide des Âges', 80);

  pdf.save(`Rapport_GereMaDime_${new Date().toISOString().split('T')[0]}.pdf`);
}

const exportToCSV = () => {
  let csvContent = "data:text/csv;charset=utf-8,";
  const history = titheStore.globalYearlyStats.history;
  
  // Section 1: KPIs
  csvContent += "SECTION: RESUME DES KPIS\n";
  csvContent += "Indicateur,Valeur\n";
  csvContent += `Total Dîmes (Mois),${titheStore.totalTithesThisMonth}\n`;
  csvContent += `Taux d'atteinte Global,${globalAchievementRate.value}\n\n`;
  
  // Section 2: Evolution
  csvContent += "SECTION: EVOLUTION MENSUELLE (REEL VS CIBLE)\n";
  csvContent += "Mois,Entrées (XAF),Cible (XAF)\n";
  history.forEach(row => {
    csvContent += `${row.month},${row.entries},${row.target}\n`;
  });
  csvContent += "\n";
  
  // Section 3: Achievement
  csvContent += "SECTION: ATTEINTE DES OBJECTIFS\n";
  csvContent += "Tranche,Nombre de membres\n";
  achievementDistribution.value.forEach(row => {
    csvContent += `${row.label},${row.count}\n`;
  });
  csvContent += "\n";
  
  // Section 4: Demographics
  csvContent += "SECTION: DEMOGRAPHIE (AGES)\n";
  csvContent += "Tranche d'âge,Nombre de membres\n";
  ageGroups.value.forEach(row => {
    csvContent += `${row.range},${row.count}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Donnees_Rapports_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-8 animate-in fade-in duration-500">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-gray-900 font-display">Rapports & Statistiques</h1>
          <p class="text-muted-foreground mt-1">Analyse consolidée des finances et de la démographie.</p>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 text-sm cursor-pointer hover:border-amber-500 transition-all shadow-sm">
            <CalendarIcon class="w-4 h-4 text-amber-600" />
            <span class="font-medium">Année 2026</span>
            <ChevronDown class="w-4 h-4 text-gray-400" />
          </div>
          
          <Button variant="outline" class="border-amber-600 text-amber-600 hover:bg-amber-50 gap-2 font-semibold" @click="exportToPDF">
            <FileDown class="w-4 h-4" />
            Exporter PDF
          </Button>
          <Button class="bg-amber-600 text-white hover:bg-amber-700 gap-2 font-semibold shadow-md" @click="exportToCSV">
            <Download class="w-4 h-4" />
            CSV
          </Button>
        </div>
      </div>

      <!-- KPIs (Consistent with Dashboard) -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 lg:max-w-4xl">
        <StatCard
          title="Total des Dîmes (Mensuel)"
          :value="formatCurrency(titheStore.totalTithesThisMonth)"
          :icon="Banknote"
          description="Total cumulé ce mois-ci"
          :trend="{ value: '+12.5%', positive: true }"
        />
        <StatCard
          title="Taux d'atteinte Global"
          :value="globalAchievementRate"
          :icon="Gem"
          description="Progression vers l'objectif total"
        />
      </div>

      <!-- Main Content with Tabs -->
      <Tabs defaultValue="tithes" class="w-full">
        <TabsList class="mb-4">
          <TabsTrigger value="tithes" class="flex items-center gap-2">
            <Banknote class="w-4 h-4" />
            Dîmes
          </TabsTrigger>
          <TabsTrigger value="demographics" class="flex items-center gap-2">
            <Users class="w-4 h-4" />
            Démographie
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tithes" class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Annual Evolution (Real vs Target) -->
            <Card class="border-none shadow-sm lg:col-span-2">
              <CardHeader class="border-b border-gray-50 pb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp class="h-5 w-5 text-amber-600" />
                  Performance Annuelle (Entrées vs Objectifs)
                </h3>
                <p class="text-sm text-muted-foreground">Comparaison des entrées réelles par rapport à la cible globale sur l'année</p>
              </CardHeader>
              <CardContent class="p-6 h-[400px]">
                <EvolutionChart 
                  ref="areaChartRef" 
                  :labels="globalChartData.labels" 
                  :datasets="globalChartData.datasets" 
                />
              </CardContent>
            </Card>

            <!-- Achievement Donut -->
            <Card class="border-none shadow-sm">
              <CardHeader class="border-b border-gray-50 pb-4">
                <h3 class="text-lg font-semibold">Répartition de l'Atteinte</h3>
                <p class="text-sm text-muted-foreground">Fidèles regroupés par niveau de contribution à l'objectif</p>
              </CardHeader>
              <CardContent class="p-6 h-[350px]">
                <Doughnut ref="donutChartRef" :data="donutChartData" :options="donutOptions" />
              </CardContent>
            </Card>

            <!-- Context Info -->
            <Card class="border-none shadow-sm bg-amber-50/30">
              <CardHeader>
                <h3 class="text-lg font-semibold flex items-center gap-2">
                  <Gem class="h-5 w-5 text-amber-600" />
                  Aperçu Stratégique
                </h3>
              </CardHeader>
              <CardContent class="space-y-4">
                <p class="text-sm text-muted-foreground leading-relaxed">
                  Cette section analyse spécifiquement la performance des dîmes. Le graphique principal compare le flux de trésorerie réel aux engagements mensuels cumulés de tous les membres.
                </p>
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="font-medium text-gray-700">Taux moyen d'atteinte</span>
                    <span class="font-bold text-amber-700">{{ globalAchievementRate }}</span>
                  </div>
                  <div class="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
                    <div class="h-full bg-amber-500" :style="{ width: globalAchievementRate }"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Age Pyramid -->
            <Card class="border-none shadow-sm lg:col-span-2">
              <CardHeader class="border-b border-gray-50 pb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2">
                  <Users class="h-5 w-5 text-amber-600" />
                  Pyramide des Âges
                </h3>
                <p class="text-sm text-muted-foreground">Répartition démographique de l'église</p>
              </CardHeader>
              <CardContent class="p-6 h-[400px]">
                <Bar ref="barChartRef" :data="barChartData" :options="commonOptions" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.font-display {
    font-family: 'Inter', sans-serif;
}
</style>
