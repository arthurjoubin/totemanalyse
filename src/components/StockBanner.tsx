interface StockBannerProps {
  ticker: string;
  exchange: string;
  companyName: string;
  dataAsOf?: string;
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
  dataAsOf,
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
  return (
    <div className="bg-white border border-gray-200 mb-4">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h1 className="text-lg font-bold text-gray-900">{companyName}</h1>
        <span className="text-gray-500 font-mono text-sm">{exchange}: {ticker}</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 md:grid-cols-5 text-center text-sm">
        <div className="p-3 border-r border-b border-gray-200">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Market Cap</p>
          <p className="font-semibold text-gray-900">{marketCap}</p>
        </div>
        <div className="p-3 border-r border-b border-gray-200">
          <p className="text-gray-500 text-xs uppercase tracking-wide">EV</p>
          <p className="font-semibold text-gray-900">{ev}</p>
        </div>
        <div className="p-3 border-r border-b border-gray-200 md:border-r">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Revenus Q3</p>
          <p className="font-semibold text-gray-900">{revenue}</p>
        </div>
        <div className="p-3 border-r border-b border-gray-200">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Croiss. YoY</p>
          <p className="font-semibold text-totem-green">{yoyGrowth}</p>
        </div>
        <div className="p-3 border-b border-gray-200">
          <p className="text-gray-500 text-xs uppercase tracking-wide">EV/Rev</p>
          <p className="font-semibold text-gray-900">{evRevenue}</p>
        </div>
        <div className="p-3 border-r border-gray-200">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Cash</p>
          <p className="font-semibold text-gray-900">{cash}</p>
        </div>
        <div className="p-3 border-r border-gray-200">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Dette</p>
          <p className="font-semibold text-gray-900">{debt}</p>
        </div>
        <div className="p-3 border-r border-gray-200">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Op. CF Q3</p>
          <p className="font-semibold text-gray-900">{opCashFlow}</p>
        </div>
        <div className="p-3 border-r border-gray-200">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Croiss. QoQ</p>
          <p className="font-semibold text-totem-green">{qoqGrowth}</p>
        </div>
        <div className="p-3">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Dilution</p>
          <p className="font-semibold text-gray-900">{dilution}</p>
        </div>
      </div>

      {dataAsOf && (
        <p className="text-xs text-gray-400 p-2 text-right border-t border-gray-200 bg-gray-50">
          Données financières: {dataAsOf}
        </p>
      )}
    </div>
  );
}
