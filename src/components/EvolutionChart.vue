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
  data: { date: string; amount: number }[];
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
  pdf.text('Rapport d\'évolution des Dîmes', 20, 30);
  
  pdf.setFontSize(12);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 20, 50);

  pdf.addImage(imgData, 'PNG', 20, 70, canvas.width, canvas.height);
  
  pdf.save('evolution-dimes.pdf');
};

defineExpose({ exportToPDF });

const chartData = computed(() => ({
  labels: props.data.map(d => d.date),
  datasets: [
    {
      label: 'Dîmes (FCFA)',
      data: props.data.map(d => d.amount),
      borderColor: '#d97706', // amber-600
      backgroundColor: 'rgba(217, 119, 6, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    }
  ]
}));

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
