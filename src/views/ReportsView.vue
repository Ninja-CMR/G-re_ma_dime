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
import { Bar, Line, Doughnut } from 'vue-chartjs'
import { jsPDF } from 'jspdf'
import DashboardLayout from '@/components/DashboardLayout.vue'
import StatCard from '@/components/StatCard.vue'
import { Card, CardContent, CardHeader, Button } from '@/components/ui'
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
    if (m.age <= 18 && groups[0]) groups[0].count++
    else if (m.age <= 30 && groups[1]) groups[1].count++
    else if (m.age <= 45 && groups[2]) groups[2].count++
    else if (m.age <= 60 && groups[3]) groups[3].count++
    else if (groups[4]) groups[4].count++
  })
  
  return groups
})

// Dynamic Tribe Distribution
const tribesDistribution = computed(() => {
  const tribeTotals: Record<string, number> = {};
  titheStore.tithes.forEach(t => {
    const member = memberStore.getMemberById(t.memberId);
    if (member) {
      tribeTotals[member.tribe] = (tribeTotals[member.tribe] || 0) + t.amount;
    }
  });
  return Object.entries(tribeTotals).map(([tribe, amount]) => ({ tribe, amount }));
})

// Evolution (Last 6 months + Current)
const evolutionHistory = [
  { month: 'Juil 25', amount: 45000 },
  { month: 'Août 25', amount: 52000 },
  { month: 'Sep 25', amount: 48000 },
  { month: 'Oct 25', amount: 61000 },
  { month: 'Nov 25', amount: 55000 },
  { month: 'Déc 25', amount: 72000 },
  { month: 'Jan 26', amount: titheStore.totalTithesThisMonth },
]

// Chart Data Configurations
const areaChartData = computed(() => ({
  labels: evolutionHistory.map(d => d.month),
  datasets: [{
    label: 'Dîmes (XAF)',
    data: evolutionHistory.map(d => d.amount),
    borderColor: colors.amber,
    backgroundColor: colors.amberLight,
    fill: true,
    tension: 0.4,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: colors.amber,
    borderWidth: 2,
  }]
}))

const donutChartData = computed(() => ({
  labels: tribesDistribution.value.map(t => t.tribe),
  datasets: [{
    data: tribesDistribution.value.map(t => t.amount),
    backgroundColor: [
      '#d97706', '#374151', '#4b5563', '#92400e', '#6b7280', '#d1d5db'
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
  pdf.text(`- Tribu Majeure: ${titheStore.mostGenerousTribe}`, 25, yPos);
  
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
  addChartToPdf(donutChartRef.value, 'Répartition par Tribu', 80);
  addChartToPdf(barChartRef.value, 'Pyramide des Âges', 80);

  pdf.save(`Rapport_GereMaDime_${new Date().toISOString().split('T')[0]}.pdf`);
}

const exportToCSV = () => {
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Section 1: KPIs
  csvContent += "SECTION: RESUME DES KPIS\n";
  csvContent += "Indicateur,Valeur\n";
  csvContent += `Total Dîmes (Mois),${titheStore.totalTithesThisMonth}\n`;
  csvContent += `Donateurs Actifs,${titheStore.activeMembersCount}\n`;
  csvContent += `Tribu Majeure,${titheStore.mostGenerousTribe}\n\n`;
  
  // Section 2: Evolution
  csvContent += "SECTION: EVOLUTION MENSUELLE\n";
  csvContent += "Mois,Montant (XAF)\n";
  evolutionHistory.forEach(row => {
    csvContent += `${row.month},${row.amount}\n`;
  });
  csvContent += "\n";
  
  // Section 3: Tribes
  csvContent += "SECTION: REPARTITION PAR TRIBU\n";
  csvContent += "Tribu,Montant total\n";
  tribesDistribution.value.forEach(row => {
    csvContent += `${row.tribe},${row.amount}\n`;
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
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total des Dîmes (Mensuel)"
          :value="formatCurrency(titheStore.totalTithesThisMonth)"
          :icon="Banknote"
          description="Total cumulé ce mois-ci"
          :trend="{ value: '+12.5%', positive: true }"
        />
        <StatCard
          title="Donateurs Enregistrés"
          :value="titheStore.activeMembersCount"
          :icon="Users"
          description="Membres de la communauté"
          :trend="{ value: '+2.1%', positive: true }"
        />
        <StatCard
          title="Tribu Majeure"
          :value="titheStore.mostGenerousTribe"
          :icon="Gem"
          description="Plus forte contribution cumulée"
        />
      </div>

      <!-- Main Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Annual Evolution -->
        <Card class="border-none shadow-sm lg:col-span-2">
          <CardHeader class="border-b border-gray-50 pb-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <TrendingUp class="h-5 w-5 text-amber-600" />
              Évolution Annuelle
            </h3>
            <p class="text-sm text-muted-foreground">Progression des versements sur les 12 derniers mois</p>
          </CardHeader>
          <CardContent class="p-6 h-[400px]">
            <Line ref="areaChartRef" :data="areaChartData" :options="commonOptions" />
          </CardContent>
        </Card>

        <!-- Tribes Donut -->
        <Card class="border-none shadow-sm">
          <CardHeader class="border-b border-gray-50 pb-4">
            <h3 class="text-lg font-semibold">Répartition par Tribu</h3>
            <p class="text-sm text-muted-foreground">Proportion des dons par origine tribale</p>
          </CardHeader>
          <CardContent class="p-6 h-[350px]">
            <Doughnut ref="donutChartRef" :data="donutChartData" :options="donutOptions" />
          </CardContent>
        </Card>

        <!-- Age Pyramid -->
        <Card class="border-none shadow-sm">
          <CardHeader class="border-b border-gray-50 pb-4">
            <h3 class="text-lg font-semibold">Pyramide des Âges</h3>
            <p class="text-sm text-muted-foreground">Démographie actuelle de l'église (Données réelles)</p>
          </CardHeader>
          <CardContent class="p-6 h-[350px]">
            <Bar ref="barChartRef" :data="barChartData" :options="commonOptions" />
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.font-display {
    font-family: 'Inter', sans-serif;
}
</style>
