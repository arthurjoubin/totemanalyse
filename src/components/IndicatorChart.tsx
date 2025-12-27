import { useEffect, useRef } from 'react';

interface IndicatorChartProps {
  symbol: string;
  title: string;
  description?: string;
}

declare global {
  interface Window {
    TradingView?: any;
  }
}

export default function IndicatorChart({ symbol, title, description }: IndicatorChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const containerId = `tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`;
    containerRef.current.id = containerId;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        widgetRef.current = new window.TradingView.widget({
          container_id: containerId,
          symbol: symbol,
          interval: 'M',
          timezone: 'Europe/Paris',
          theme: 'light',
          style: '3',
          locale: 'fr',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_top_toolbar: true,
          hide_legend: false,
          save_image: false,
          height: 280,
          width: '100%',
          range: '60M',
          hide_side_toolbar: true,
          allow_symbol_change: false,
          details: false,
          hotlist: false,
          calendar: false,
          studies: [],
          show_popup_button: false,
          popup_width: '1000',
          popup_height: '650',
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol]);

  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <div ref={containerRef} style={{ height: 280 }} />
    </div>
  );
}
