import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

export default function OilConsumptionByRegionChart() {
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

  // Récupérer les données pour chaque région
  const world = data.indicators.oil_consumption_world?.data || [];
  const usa = data.indicators.oil_consumption_usa?.data || [];
  const china = data.indicators.oil_consumption_china?.data || [];
  const europe = data.indicators.oil_consumption_europe?.data || [];
  const oecd = data.indicators.oil_consumption_oecd?.data || [];

  // Créer un ensemble de toutes les dates
  const allDates = new Set<string>();
  [world, usa, china, europe, oecd].forEach(regionData => {
    regionData.forEach(point => allDates.add(point.date));
  });

  // Convertir en tableau trié
  const dates = Array.from(allDates).sort();

  // Créer des maps pour un accès rapide
  const worldMap = new Map(world.map(d => [d.date, d.value]));
  const usaMap = new Map(usa.map(d => [d.date, d.value]));
  const chinaMap = new Map(china.map(d => [d.date, d.value]));
  const europeMap = new Map(europe.map(d => [d.date, d.value]));
  const oecdMap = new Map(oecd.map(d => [d.date, d.value]));

  // Calculer "Autres" = Monde - USA - Chine - Europe
  const othersData = dates.map(date => {
    const worldVal = worldMap.get(date) || 0;
    const usaVal = usaMap.get(date) || 0;
    const chinaVal = chinaMap.get(date) || 0;
    const europeVal = europeMap.get(date) || 0;
    return Math.max(0, worldVal - usaVal - chinaVal - europeVal);
  });

  // Préparer les labels (format année uniquement)
  const labels = dates.map(date => date.split('-')[0]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'USA',
        data: dates.map(date => usaMap.get(date) || 0),
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f615',
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
      {
        label: 'Chine',
        data: dates.map(date => chinaMap.get(date) || 0),
        borderColor: '#ef4444',
        backgroundColor: '#ef444415',
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
      {
        label: 'Europe',
        data: dates.map(date => europeMap.get(date) || 0),
        borderColor: '#f59e0b',
        backgroundColor: '#f59e0b15',
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
      {
        label: 'Autres',
        data: othersData,
        borderColor: '#8b5cf6',
        backgroundColor: '#8b5cf615',
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
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
        },
      },
    },
    scales: {
      x: {
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
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Consommation de Pétrole par Zone Géographique</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Évolution de la consommation de pétrole par région (USA, Chine, Europe, Autres)
        </p>
      </div>

      <div className="p-4" style={{ height: '400px' }}>
        <Line data={chartData} options={options} />
      </div>

      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400">Source: EIA (Energy Information Administration)</p>
      </div>
    </div>
  );
}
