import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
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

type TimeRange = '1y' | '5y' | '10y';

interface LocalChartProps {
  indicatorKey: string;
  color?: string;
  globalTimeRange?: TimeRange;
}

export default function LocalChart({ indicatorKey, color = '#006B4F', globalTimeRange }: LocalChartProps) {
  const [indicator, setIndicator] = useState<IndicatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localTimeRange, setLocalTimeRange] = useState<TimeRange>('10y');
  const [showCopied, setShowCopied] = useState(false);
  const chartRef = useRef<any>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Lire le paramètre de temps depuis l'URL au chargement
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTimeRange = params.get(`${indicatorKey}_time`) as TimeRange;
    if (urlTimeRange && ['1y', '5y', '10y'].includes(urlTimeRange)) {
      setLocalTimeRange(urlTimeRange);
    }
  }, [indicatorKey]);

  // Écouter les changements globaux de timeline
  useEffect(() => {
    const handleGlobalChange = (event: any) => {
      const newRange = event.detail.range as TimeRange;
      if (['1y', '5y', '10y'].includes(newRange)) {
        setLocalTimeRange(newRange);
      }
    };

    window.addEventListener('globalTimeRangeChange', handleGlobalChange);
    return () => window.removeEventListener('globalTimeRangeChange', handleGlobalChange);
  }, []);

  // Scroller vers ce graphique si l'URL contient son hash
  useEffect(() => {
    if (window.location.hash === `#chart-${indicatorKey}`) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500); // Délai pour laisser le temps au composant de se charger
    }
  }, [indicatorKey]);

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

  // Utiliser globalTimeRange si fourni, sinon localTimeRange
  const activeTimeRange = globalTimeRange || localTimeRange;

  // Filtrer les données selon la période
  const filterDataByTimeRange = (data: DataPoint[], range: TimeRange): DataPoint[] => {
    const now = new Date();
    const cutoffDate = new Date(now);

    switch (range) {
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case '5y':
        cutoffDate.setFullYear(now.getFullYear() - 5);
        break;
      case '10y':
        cutoffDate.setFullYear(now.getFullYear() - 10);
        break;
    }

    return data.filter(d => new Date(d.date) >= cutoffDate);
  };

  // Fonction pour copier le lien partageable
  const handleShare = () => {
    const url = new URL(window.location.href);
    // Nettoyer les anciens paramètres de temps et hash
    url.search = '';
    url.hash = '';
    // Ajouter le paramètre de temps et le hash pour ce graphique
    url.searchParams.set(`${indicatorKey}_time`, activeTimeRange);
    url.hash = `chart-${indicatorKey}`;
    navigator.clipboard.writeText(url.toString());
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  // Fonction pour télécharger le screenshot
  const handleScreenshot = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: '#ffffff',
          scale: 2, // Pour une meilleure qualité
          logging: false,
        });

        const link = document.createElement('a');
        link.download = `${indicator?.name || indicatorKey}-${activeTimeRange}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Erreur lors de la capture du screenshot:', error);
      }
    }
  };

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

  // Filtrer les données selon la période active
  const filteredData = filterDataByTimeRange(indicator.data, activeTimeRange);

  const labels = filteredData.map(d => {
    const [year, month] = d.date.split('-');
    return `${month}/${year.slice(2)}`;
  });

  const values = filteredData.map(d => d.value);
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const change = ((lastValue - firstValue) / firstValue * 100).toFixed(1);
  const isPositive = lastValue >= firstValue;

  const timeRangeLabel = activeTimeRange === '1y' ? '1 an' : activeTimeRange === '5y' ? '5 ans' : '10 ans';

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
    <div ref={cardRef} id={`chart-${indicatorKey}`} className="bg-white border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{indicator.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{indicator.description}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900 text-sm">{formatValue(lastValue)}</p>
            <p className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{change}% ({timeRangeLabel})
            </p>
          </div>
        </div>

        {/* Contrôles individuels (seulement si pas de contrôle global) */}
        {!globalTimeRange && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex gap-1">
              <button
                onClick={() => setLocalTimeRange('1y')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  activeTimeRange === '1y'
                    ? 'bg-totem-green text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                1 an
              </button>
              <button
                onClick={() => setLocalTimeRange('5y')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  activeTimeRange === '5y'
                    ? 'bg-totem-green text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                5 ans
              </button>
              <button
                onClick={() => setLocalTimeRange('10y')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  activeTimeRange === '10y'
                    ? 'bg-totem-green text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                10 ans
              </button>
            </div>

            <div className="flex gap-1">
              <button
                onClick={handleShare}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors relative"
                title="Copier le lien"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {showCopied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Lien copié !
                  </span>
                )}
              </button>
              <button
                onClick={handleScreenshot}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Télécharger le graphique"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4" style={{ height: '200px' }}>
        <Line ref={chartRef} data={chartData} options={options} />
      </div>

      {indicator.source && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400">Source: {indicator.source}</p>
        </div>
      )}
    </div>
  );
}
