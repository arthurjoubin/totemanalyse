import { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  ticker: string;
  exchange: string;
}

export default function TradingViewChart({ ticker, exchange }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert to TradingView format
  const getTradingViewSymbol = (): string => {
    // Map exchange codes to TradingView format
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

    // Handle tickers like "HKG: 1843" -> "1843"
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
      dateRange: '12M',
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
  }, [ticker, exchange]);

  return (
    <div className="bg-white border border-gray-200 mb-4">
      <div
        ref={containerRef}
        className="h-[220px] w-full"
      />
      <p className="text-xs text-gray-400 px-3 py-1 text-right border-t border-gray-200 bg-gray-50">
        Chart par TradingView
      </p>
    </div>
  );
}
