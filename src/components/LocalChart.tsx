import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

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

interface LocalChartProps {
  indicatorKey: string;
  color?: string;
}

export default function LocalChart({ indicatorKey, color = '#006B4F' }: LocalChartProps) {
  const [indicator, setIndicator] = useState<IndicatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/indicators.json')
      .then(res => res.json())
      .then(data => {
        if (data.indicators[indicatorKey]) {
          setIndicator(data.indicators[indicatorKey]);
        } else {
          setError('Indicateur non trouvé');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Erreur de chargement');
        setLoading(false);
      });
  }, [indicatorKey]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-48 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !indicator) {
    return (
      <div className="bg-white border border-gray-200 p-6">
        <p className="text-gray-500 text-sm">{error || 'Données non disponibles'}</p>
      </div>
    );
  }

  const labels = indicator.data.map(d => {
    const [year, month] = d.date.split('-');
    return `${month}/${year.slice(2)}`;
  });

  const values = indicator.data.map(d => d.value);
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const change = ((lastValue - firstValue) / firstValue * 100).toFixed(1);
  const isPositive = lastValue >= firstValue;

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: color,
        backgroundColor: `${color}15`,
        fill: true,
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
        display: false,
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        padding: 8,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            if (indicator.unit === '%') {
              return `${value.toFixed(2)}%`;
            } else if (indicator.unit === '$/oz' || indicator.unit === '$/baril' || indicator.unit === '$') {
              return `$${value.toLocaleString()}`;
            } else if (indicator.unit === '€/m²') {
              return `${value.toLocaleString()} €/m²`;
            }
            return value.toLocaleString();
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
          maxTicksLimit: 8,
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
            if (indicator.unit === '%') {
              return `${value}%`;
            } else if (value >= 1000) {
              return `${(value / 1000).toFixed(0)}k`;
            }
            return value;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const formatValue = (val: number) => {
    if (indicator.unit === '%') {
      return `${val.toFixed(2)}%`;
    } else if (indicator.unit === '$/oz' || indicator.unit === '$/baril' || indicator.unit === '$') {
      return `$${val.toLocaleString()}`;
    } else if (indicator.unit === '€/m²') {
      return `${val.toLocaleString()} €/m²`;
    } else if (indicator.unit === 'points') {
      return val.toLocaleString();
    }
    return val.toString();
  };

  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{indicator.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{indicator.description}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900 text-sm">{formatValue(lastValue)}</p>
            <p className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{change}% (10 ans)
            </p>
          </div>
        </div>
      </div>
      <div className="p-4" style={{ height: '200px' }}>
        <Line data={chartData} options={options} />
      </div>
      {indicator.source && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400">Source: {indicator.source}</p>
        </div>
      )}
    </div>
  );
}
