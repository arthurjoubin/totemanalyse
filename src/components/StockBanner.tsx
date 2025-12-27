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
      <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50">
        <h1 className="text-base md:text-lg font-bold text-gray-900">{companyName}</h1>
        <span className="text-gray-500 font-mono text-xs md:text-sm">{exchange}: {ticker}</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 text-center text-xs md:text-sm">
        <div className="p-2 md:p-3 border-r border-b border-gray-200">
          <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wide">Mkt Cap</p>
          <p className="font-semibold text-gray-900 text-sm md:text-base">{marketCap}</p>
        </div>
        <div className="p-2 md:p-3 border-b border-gray-200 md:border-r">
          <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wide">EV</p>
          <p className="font-semibold text-gray-900 text-sm md:text-base">{ev}</p>
        </div>
        <div className="p-2 md:p-3 border-r border-b border-gray-200">
          <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wide">Rev. Q3</p>
          <p className="font-semibold text-gray-900 text-sm md:text-base">{revenue}</p>
        </div>
        <div className="p-2 md:p-3 border-b border-gray-200 md:border-r">
          <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wide">YoY</p>
          <p className="font-semibold text-totem-green text-sm md:text-base">{yoyGrowth}</p>
        </div>
        <div className="p-2 md:p-3 border-r border-b border-gray-200 md:border-r-0 md:border-b">
          <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wide">EV/Rev</p>
          <p className="font-semibold text-gray-900 text-sm md:text-base">{evRevenue}</p>
        </div>
        <div className="p-2 md:p-3 border-b border-gray-200 md:border-r md:border-b-0">
          <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wide">Cash</p>
          <p className="font-semibold text-gray-900 text-sm md:text-base">{cash}</p>
        </div>
        <div className="p-2 md:p-3 border-r border-gray-200 md:border-b-0">
          <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wide">Dette</p>
          <p className="font-semibold text-gray-900 text-sm md:text-base">{debt}</p>
        </div>
        <div className="p-2 md:p-3 border-gray-200 md:border-r md:border-b-0">
          <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wide">CF Q3</p>
          <p className="font-semibold text-gray-900 text-sm md:text-base">{opCashFlow}</p>
        </div>
        <div className="p-2 md:p-3 border-r border-gray-200 md:border-b-0">
          <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wide">QoQ</p>
          <p className="font-semibold text-totem-green text-sm md:text-base">{qoqGrowth}</p>
        </div>
        <div className="p-2 md:p-3 md:border-b-0">
          <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wide">Dilut.</p>
          <p className="font-semibold text-gray-900 text-sm md:text-base">{dilution}</p>
        </div>
      </div>

      {dataAsOf && (
        <p className="text-[10px] md:text-xs text-gray-400 p-1.5 md:p-2 text-right border-t border-gray-200 bg-gray-50">
          Données: {dataAsOf}
        </p>
      )}
    </div>
  );
}
