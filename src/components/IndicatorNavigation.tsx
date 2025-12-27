interface IndicatorInfo {
  key: string;
  name: string;
  category: string;
  color: string;
  icon: string;
}

const indicators: IndicatorInfo[] = [
  // Indices Boursiers
  { key: 'sp500', name: 'S&P 500', category: 'Indices', color: '#006B4F', icon: '📈' },
  { key: 'cac40', name: 'CAC 40', category: 'Indices', color: '#1e40af', icon: '🇫🇷' },
  // Matières Premières
  { key: 'gold', name: 'Or', category: 'Matières', color: '#ca8a04', icon: '🥇' },
  { key: 'brent', name: 'Pétrole Brent', category: 'Matières', color: '#0f172a', icon: '🛢️' },
  // Crypto
  { key: 'bitcoin', name: 'Bitcoin', category: 'Crypto', color: '#f7931a', icon: '₿' },
  // Taux
  { key: 'fr10y', name: 'US 10 ans', category: 'Taux', color: '#dc2626', icon: '📊' },
];

interface IndicatorNavigationProps {
  currentIndicator: string;
}

export default function IndicatorNavigation({ currentIndicator }: IndicatorNavigationProps) {
  const currentIndex = indicators.findIndex(i => i.key === currentIndicator);
  const current = indicators[currentIndex];

  // Grouper les indicateurs par catégorie
  const categories = indicators.reduce((acc, ind) => {
    if (!acc[ind.category]) {
      acc[ind.category] = [];
    }
    acc[ind.category].push(ind);
    return acc;
  }, {} as Record<string, IndicatorInfo[]>);

  return (
    <div className="mb-8">
      {/* Navigation rapide - Autres indicateurs */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Autres indicateurs
        </h3>

        <div className="space-y-3">
          {Object.entries(categories).map(([category, items]) => (
            <div key={category}>
              <p className="text-xs text-gray-400 mb-1.5">{category}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((indicator) => {
                  const isCurrent = indicator.key === currentIndicator;
                  return (
                    <a
                      key={indicator.key}
                      href={`/indicateurs/${indicator.key}/`}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                        isCurrent
                          ? 'bg-gray-900 text-white cursor-default'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                      }`}
                      style={isCurrent ? {} : { borderLeft: `3px solid ${indicator.color}` }}
                    >
                      <span className="text-xs">{indicator.icon}</span>
                      <span>{indicator.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Lien retour */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <a
            href="/indicateurs/"
            className="inline-flex items-center gap-2 text-sm text-totem-green hover:text-totem-light transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Voir tous les indicateurs
          </a>
        </div>
      </div>
    </div>
  );
}
