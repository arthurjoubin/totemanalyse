interface IndicatorInfo {
  key: string;
  name: string;
}

const indicators: IndicatorInfo[] = [
  { key: 'sp500', name: 'S&P 500' },
  { key: 'nasdaq', name: 'NASDAQ' },
  { key: 'cac40', name: 'CAC 40' },
  { key: 'dax', name: 'DAX' },
  { key: 'nikkei', name: 'Nikkei 225' },
  { key: 'gold', name: 'Or' },
  { key: 'silver', name: 'Argent' },
  { key: 'brent', name: 'Pétrole' },
  { key: 'natgas', name: 'Gaz' },
  { key: 'eurusd', name: 'EUR/USD' },
  { key: 'bitcoin', name: 'Bitcoin' },
  { key: 'fr10y', name: 'US 10Y' },
  // EIA Energy indicators
  { key: 'oil_consumption_world', name: 'Pétrole Monde' },
  { key: 'oil_consumption_usa', name: 'Pétrole USA' },
  { key: 'oil_consumption_china', name: 'Pétrole Chine' },
  { key: 'oil_consumption_oecd', name: 'Pétrole OCDE' },
  { key: 'us_oil_stocks', name: 'Stocks US' },
  { key: 'energy_petroleum', name: 'Conso. Pétrole' },
  { key: 'energy_natgas', name: 'Conso. Gaz' },
  { key: 'energy_coal', name: 'Conso. Charbon' },
  { key: 'energy_nuclear', name: 'Conso. Nucléaire' },
  { key: 'energy_renewables', name: 'Conso. Renouvelables' },
];

interface IndicatorNavigationProps {
  currentIndicator: string;
}

export default function IndicatorNavigation({ currentIndicator }: IndicatorNavigationProps) {
  const otherIndicators = indicators.filter(i => i.key !== currentIndicator);

  return (
    <div className="border-t border-gray-200 pt-6 mt-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <span className="text-xs text-gray-400 uppercase tracking-wide">Autres indicateurs</span>
        <div className="flex items-center gap-3 flex-wrap">
          {otherIndicators.map((indicator, index) => (
            <span key={indicator.key} className="flex items-center gap-3">
              <a
                href={`/indicateurs/${indicator.key}/`}
                className="text-sm text-gray-600 hover:text-totem-green transition-colors"
              >
                {indicator.name}
              </a>
              {index < otherIndicators.length - 1 && (
                <span className="text-gray-300">·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
