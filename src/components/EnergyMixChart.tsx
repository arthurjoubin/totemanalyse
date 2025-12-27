import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DataPoint {
  date: string;
  value: number;
}

interface IndicatorData {
  name: string;
  description: string;
  unit: string;
  source?: string;
  data: DataPoint[];
}

interface IndicatorsData {
  lastUpdated: string;
  indicators: {
    [key: string]: IndicatorData;
  };
}

export default function EnergyMixChart() {
  const [data, setData] = useState<IndicatorsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/indicators.json')
      .then(res => res.json())
      .then(jsonData => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur de chargement:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-96 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border border-gray-200 p-6">
        <p className="text-gray-500 text-sm">Données non disponibles</p>
      </div>
    );
  }

  // Récupérer les données pour chaque type d'énergie
  const petroleum = data.indicators.energy_petroleum?.data || [];
  const natgas = data.indicators.energy_natgas?.data || [];
  const coal = data.indicators.energy_coal?.data || [];
  const nuclear = data.indicators.energy_nuclear?.data || [];
  const renewables = data.indicators.energy_renewables?.data || [];

  // Créer un ensemble de toutes les dates
  const allDates = new Set<string>();
  [petroleum, natgas, coal, nuclear, renewables].forEach(energyData => {
    energyData.forEach(point => allDates.add(point.date));
  });

  // Convertir en tableau trié
  const dates = Array.from(allDates).sort();

  // Créer des maps pour un accès rapide
  const petroleumMap = new Map(petroleum.map(d => [d.date, d.value]));
  const natgasMap = new Map(natgas.map(d => [d.date, d.value]));
  const coalMap = new Map(coal.map(d => [d.date, d.value]));
  const nuclearMap = new Map(nuclear.map(d => [d.date, d.value]));
  const renewablesMap = new Map(renewables.map(d => [d.date, d.value]));

  // Préparer les labels (format année uniquement)
  const labels = dates.map(date => date.split('-')[0]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Pétrole',
        data: dates.map(date => petroleumMap.get(date) || 0),
        backgroundColor: '#0f172a',
      },
      {
        label: 'Gaz Naturel',
        data: dates.map(date => natgasMap.get(date) || 0),
        backgroundColor: '#0ea5e9',
      },
      {
        label: 'Charbon',
        data: dates.map(date => coalMap.get(date) || 0),
        backgroundColor: '#374151',
      },
      {
        label: 'Nucléaire',
        data: dates.map(date => nuclearMap.get(date) || 0),
        backgroundColor: '#eab308',
      },
      {
        label: 'Renouvelables',
        data: dates.map(date => renewablesMap.get(date) || 0),
        backgroundColor: '#22c55e',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 11 },
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        padding: 8,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value.toFixed(2)} quad Btu`;
          },
          footer: (tooltipItems: any) => {
            const total = tooltipItems.reduce((sum: number, item: any) => sum + item.parsed.y, 0);
            return `Total: ${total.toFixed(2)} quad Btu`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 10 },
          color: '#9ca3af',
          maxTicksLimit: 15,
        },
      },
      y: {
        stacked: true,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          font: { size: 10 },
          color: '#9ca3af',
          callback: (value: any) => {
            return `${value} quad Btu`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Mix Énergétique Mondial - Consommation par Type</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Répartition de la consommation mondiale d'énergie par source (Pétrole, Gaz, Charbon, Nucléaire, Renouvelables)
        </p>
      </div>

      <div className="p-4" style={{ height: '400px' }}>
        <Bar data={chartData} options={options} />
      </div>

      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400">Source: EIA (Energy Information Administration)</p>
      </div>
    </div>
  );
}
