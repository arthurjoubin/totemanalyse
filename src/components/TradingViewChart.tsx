import { useEffect, useRef, useState } from 'react';

interface TradingViewChartProps {
  ticker: string;
  exchange: string;
}

const timeframes = [
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '1A', value: '12M' },
  { label: '5A', value: '60M' },
  { label: 'Max', value: 'ALL' },
];

export default function TradingViewChart({ ticker, exchange }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState('12M');

  // Convert to TradingView format
  const getTradingViewSymbol = (): string => {
    const exchangeMap: Record<string, string> = {
      'HKG': 'HKEX',
      'NASDAQ': 'NASDAQ',
      'NYSE': 'NYSE',
      'EURONEXT': 'EURONEXT',
      'LSE': 'LSE',
      'TSE': 'TSE',
      'SGX': 'SGX',
    };

    const tvExchange = exchangeMap[exchange] || exchange;
    const cleanTicker = ticker.includes(':')
      ? ticker.split(':')[1].trim()
      : ticker;

    return `${tvExchange}:${cleanTicker}`;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    containerRef.current.innerHTML = '';

    const symbol = getTradingViewSymbol();

    // Create the widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    widgetContainer.appendChild(widgetDiv);

    // Create and load the TradingView script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: '100%',
      height: '100%',
      locale: 'fr',
      dateRange: dateRange,
      colorTheme: 'light',
      isTransparent: true,
      autosize: true,
      largeChartUrl: `https://www.tradingview.com/chart/?symbol=${symbol}`,
      noTimeScale: false,
      chartOnly: false
    });

    widgetContainer.appendChild(script);
    containerRef.current.appendChild(widgetContainer);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [ticker, exchange, dateRange]);

  return (
    <div className="bg-white border border-gray-200 mb-4">
      <div
        ref={containerRef}
        className="h-[220px] w-full"
      />
      <div className="flex justify-between items-center px-3 py-1 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setDateRange(tf.value)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                dateRange === tf.value
                  ? 'bg-totem-green text-white'
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">Chart par TradingView</span>
      </div>
    </div>
  );
}
