import { useEffect, useRef } from 'react';

interface FinancialChartsProps {
  ticker: string;
  exchange: string;
}

// Widget component for individual TradingView widgets
function TradingViewWidget({
  ticker,
  exchange,
  title,
  scriptSrc,
  config,
  height = '400px'
}: {
  ticker: string;
  exchange: string;
  title: string;
  scriptSrc: string;
  config: any;
  height?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

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

    containerRef.current.innerHTML = '';
    const symbol = getTradingViewSymbol();

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    widgetContainer.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      ...config
    });

    widgetContainer.appendChild(script);
    containerRef.current.appendChild(widgetContainer);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [ticker, exchange, scriptSrc, config]);

  return (
    <div className="bg-white border border-gray-200 mb-4">
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div
        ref={containerRef}
        style={{ height }}
        className="w-full"
      />
      <div className="flex justify-end items-center px-3 py-1 border-t border-gray-200 bg-gray-50">
        <span className="text-xs text-gray-400">Par TradingView</span>
      </div>
    </div>
  );
}

export default function FinancialCharts({ ticker, exchange }: FinancialChartsProps) {
  const baseConfig = {
    width: '100%',
    height: '100%',
    locale: 'fr',
    colorTheme: 'light',
    isTransparent: true,
    autosize: true
  };

  return (
    <div className="space-y-4">
      {/* 1. Financials Widget - Tableau complet de toutes les données financières */}
      <TradingViewWidget
        ticker={ticker}
        exchange={exchange}
        title="1. Financials Widget (Complet) - Toutes les données financières"
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-financials.js"
        config={{
          ...baseConfig,
          displayMode: 'regular',
          largeChartUrl: ''
        }}
        height="400px"
      />

      {/* 2. Financials Widget en mode Compact */}
      <TradingViewWidget
        ticker={ticker}
        exchange={exchange}
        title="2. Financials Widget (Compact) - Version condensée"
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-financials.js"
        config={{
          ...baseConfig,
          displayMode: 'compact',
          largeChartUrl: ''
        }}
        height="300px"
      />

      {/* 3. Symbol Info Widget - Vue d'ensemble simplifiée */}
      <TradingViewWidget
        ticker={ticker}
        exchange={exchange}
        title="3. Symbol Info Widget - Vue d'ensemble simplifiée"
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js"
        config={baseConfig}
        height="250px"
      />

      {/* 4. Fundamental Data Widget - Deep dive dans les fondamentaux */}
      <TradingViewWidget
        ticker={ticker}
        exchange={exchange}
        title="4. Fundamental Data Widget - Analyse approfondie"
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-fundamental-data.js"
        config={baseConfig}
        height="300px"
      />

      {/* 5. Company Profile Widget - Description de l'entreprise */}
      <TradingViewWidget
        ticker={ticker}
        exchange={exchange}
        title="5. Company Profile Widget - Profil de l'entreprise"
        scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js"
        config={baseConfig}
        height="200px"
      />
    </div>
  );
}
