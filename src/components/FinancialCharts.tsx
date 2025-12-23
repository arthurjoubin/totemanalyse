import { useEffect, useRef, useState } from 'react';

interface FinancialChartsProps {
  ticker: string;
  exchange: string;
}

type FinancialMetric = 'total_revenue' | 'operating_cash_flow' | 'net_income' | 'EBITDA';

const metrics: { label: string; value: FinancialMetric }[] = [
  { label: 'Revenus', value: 'total_revenue' },
  { label: 'Operating CF', value: 'operating_cash_flow' },
  { label: 'EBITDA', value: 'EBITDA' },
  { label: 'Revenu Net', value: 'net_income' },
];

export default function FinancialCharts({ ticker, exchange }: FinancialChartsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedMetric, setSelectedMetric] = useState<FinancialMetric>('total_revenue');

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

    // Create and load the TradingView script for financials
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-financials.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: '100%',
      height: '100%',
      locale: 'fr',
      colorTheme: 'light',
      isTransparent: true,
      displayMode: 'regular',
      largeChartUrl: '',
      autosize: true
    });

    widgetContainer.appendChild(script);
    containerRef.current.appendChild(widgetContainer);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [ticker, exchange, selectedMetric]);

  return (
    <div className="bg-white border border-gray-200 mb-4">
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Données Financières</h3>
      </div>
      <div
        ref={containerRef}
        className="h-[400px] w-full"
      />
      <div className="flex justify-end items-center px-3 py-1 border-t border-gray-200 bg-gray-50">
        <span className="text-xs text-gray-400">Financials par TradingView</span>
      </div>
    </div>
  );
}
