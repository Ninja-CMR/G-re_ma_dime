<script setup lang="ts">
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { computed, ref } from 'vue';
import { jsPDF } from 'jspdf';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const props = defineProps<{
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
    fill?: boolean;
    borderDash?: number[];
  }[];
}>();

const chartRef = ref<any>(null);

const exportToPDF = () => {
  if (!chartRef.value || !chartRef.value.chart) return;

  const chart = chartRef.value.chart;
  const canvas = chart.canvas;
  const imgData = canvas.toDataURL('image/png', 1.0);

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvas.width + 40, canvas.height + 100]
  });

  pdf.setFontSize(18);
  pdf.setTextColor(217, 119, 6); // amber-600
  pdf.text('Rapport d\'évolution', 20, 30);
  
  pdf.setFontSize(12);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 20, 50);

  pdf.addImage(imgData, 'PNG', 20, 70, canvas.width, canvas.height);
  
  pdf.save('rapport-evolution.pdf');
};

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map(ds => ({
    label: ds.label,
    data: ds.data,
    borderColor: ds.color,
    backgroundColor: ds.fill ? `${ds.color}1A` : 'transparent', // 10% opacity for fill
    fill: ds.fill ?? false,
    tension: 0.4,
    pointRadius: 4,
    pointHoverRadius: 6,
    borderDash: ds.borderDash || [],
  }))
}));

defineExpose({ 
  exportToPDF,
  chart: computed(() => chartRef.value?.chart)
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#1f2937',
      bodyColor: '#4b5563',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 12,
      displayColors: false,
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: { size: 10 }
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#f3f4f6'
      },
      ticks: {
        font: { size: 10 },
        callback: (value: any) => value.toLocaleString() + ' F'
      }
    }
  }
};
</script>

<template>
  <div class="h-[300px] w-full">
    <Line ref="chartRef" :data="chartData" :options="chartOptions" />
  </div>
</template>
