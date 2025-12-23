import { useState, useEffect } from 'react';

interface StockBannerProps {
  ticker: string;
  exchange: string;
  companyName: string;
  marketCap: string;
  ev: string;
  revenue: string;
  yoyGrowth: string;
  evRevenue: string;
  cash: string;
  debt: string;
  opCashFlow: string;
  qoqGrowth: string;
  dilution: string;
}

export default function StockBanner({
  ticker,
  exchange,
  companyName,
  marketCap,
  ev,
  revenue,
  yoyGrowth,
  evRevenue,
  cash,
  debt,
  opCashFlow,
  qoqGrowth,
  dilution
}: StockBannerProps) {
  const [stockPrice, setStockPrice] = useState<string>('--');
  const [stockChange, setStockChange] = useState<string>('--');
  const [changeClass, setChangeClass] = useState<string>('text-sm');
  const [lastUpdate, setLastUpdate] = useState<string>('--');
  const [computedMarketCap, setComputedMarketCap] = useState<string>(marketCap);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
        const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(yahooUrl);

        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data.chart && data.chart.result && data.chart.result[0]) {
          const quote = data.chart.result[0].meta;
          const price = quote.regularMarketPrice;
          const previousClose = quote.chartPreviousClose || quote.previousClose;
          const change = price - previousClose;
          const changePercent = (change / previousClose) * 100;

          setStockPrice(`$${price.toFixed(2)}`);

          const isPositive = change >= 0;
          setStockChange(
            `${isPositive ? '▲' : '▼'} ${Math.abs(change).toFixed(2)} (${isPositive ? '+' : ''}${changePercent.toFixed(2)}%)`
          );
          setChangeClass(`text-lg font-medium ${isPositive ? 'text-green-300' : 'text-red-300'}`);

          const mktCap = quote.regularMarketPrice * (quote.sharesOutstanding || 44000000);
          setComputedMarketCap(formatNumber(mktCap));

          setLastUpdate(`Dernière mise à jour: ${new Date().toLocaleString('fr-FR')}`);
        }
      } catch (error) {
        console.error('Error fetching stock data:', error);
        setStockPrice('$210');
        setStockChange('--');
        setLastUpdate('Données statiques (API indisponible)');
      }
    };

    fetchStockData();
    const interval = setInterval(fetchStockData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [ticker]);

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(0)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
    return '$' + num.toString();
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-green-50 border border-green-100 rounded-lg mb-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-green-100">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{companyName}</h1>
          <span className="text-gray-500 font-mono text-sm">{exchange}: {ticker}</span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{stockPrice}</p>
          <p className={changeClass}>{stockChange}</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 md:grid-cols-5 text-center text-sm">
        <div className="p-3 border-r border-b border-green-100">
          <p className="text-gray-500 text-xs">Market Cap</p>
          <p className="font-semibold text-gray-900">{computedMarketCap}</p>
        </div>
        <div className="p-3 border-r border-b border-green-100">
          <p className="text-gray-500 text-xs">EV</p>
          <p className="font-semibold text-gray-900">{ev}</p>
        </div>
        <div className="p-3 border-r border-b border-green-100 md:border-r">
          <p className="text-gray-500 text-xs">Revenus Q3</p>
          <p className="font-semibold text-gray-900">{revenue}</p>
        </div>
        <div className="p-3 border-r border-b border-green-100">
          <p className="text-gray-500 text-xs">Croissance YoY</p>
          <p className="font-semibold text-totem-green">{yoyGrowth}</p>
        </div>
        <div className="p-3 border-b border-green-100">
          <p className="text-gray-500 text-xs">EV/Revenus</p>
          <p className="font-semibold text-gray-900">{evRevenue}</p>
        </div>
        <div className="p-3 border-r border-green-100">
          <p className="text-gray-500 text-xs">Cash</p>
          <p className="font-semibold text-gray-900">{cash}</p>
        </div>
        <div className="p-3 border-r border-green-100">
          <p className="text-gray-500 text-xs">Dette</p>
          <p className="font-semibold text-gray-900">{debt}</p>
        </div>
        <div className="p-3 border-r border-green-100">
          <p className="text-gray-500 text-xs">Op. Cash Flow Q3</p>
          <p className="font-semibold text-gray-900">{opCashFlow}</p>
        </div>
        <div className="p-3 border-r border-green-100">
          <p className="text-gray-500 text-xs">Croissance QoQ</p>
          <p className="font-semibold text-totem-green">{qoqGrowth}</p>
        </div>
        <div className="p-3">
          <p className="text-gray-500 text-xs">Dilution</p>
          <p className="font-semibold text-gray-900">{dilution}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 p-2 text-right border-t border-green-100">{lastUpdate}</p>
    </div>
  );
}
