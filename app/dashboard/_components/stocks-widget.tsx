'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { TICKERS, MACRO_LIST, fetchYahoo } from '@/lib/providers/stocks';
import { formatPrice, formatPercent } from '@/lib/utils/format';
import type { QuoteResult, TickerConfig } from '@/types/api';

type TabKey = 'portfel' | 'makro';

interface StockRow {
  config: TickerConfig;
  quote: QuoteResult | null;
  loading: boolean;
}

const REFRESH_INTERVAL_S = 120;

function isNYSEOpen(): boolean {
  const nyDate = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
  );
  const day = nyDate.getDay();
  if (day === 0 || day === 6) return false;
  const totalMin = nyDate.getHours() * 60 + nyDate.getMinutes();
  return totalMin >= 570 && totalMin < 960;
}

function Sparkline({ closes }: { closes: number[] }) {
  if (closes.length < 2) return null;

  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const width = 60;
  const height = 20;

  const points = closes.map((c, i) => {
    const x = (i / (closes.length - 1)) * width;
    const y = height - ((c - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const isUp = closes[closes.length - 1] >= closes[0];

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? 'var(--nom)' : 'var(--az)'}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SkeletonRow() {
  return (
    <div className="stock-row">
      <div className="skeleton" style={{ width: '3rem', height: '0.8rem' }} />
      <div className="flex-1">
        <div className="skeleton" style={{ width: '4rem', height: '0.6rem' }} />
      </div>
      <div className="skeleton" style={{ width: '3.5rem', height: '1.2rem' }} />
      <div className="skeleton" style={{ width: '3rem', height: '0.8rem' }} />
      <div className="skeleton" style={{ width: '3.5rem', height: '0.8rem' }} />
    </div>
  );
}

export default function StocksWidget() {
  const hydrated = useHydration();
  const [tab, setTab] = useState<TabKey>('portfel');
  const [rows, setRows] = useState<StockRow[]>([]);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_S);
  const [marketOpen, setMarketOpen] = useState(false);
  const fetchingRef = useRef(false);

  const tickers = tab === 'portfel' ? TICKERS : MACRO_LIST;

  const fetchAll = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    const initialRows: StockRow[] = tickers.map((config) => ({
      config,
      quote: null,
      loading: true,
    }));
    setRows(initialRows);

    const results = await Promise.allSettled(
      tickers.map((t) => fetchYahoo(t.sym)),
    );

    const updatedRows: StockRow[] = tickers.map((config, idx) => {
      const result = results[idx];
      return {
        config,
        quote: result.status === 'fulfilled' ? result.value : null,
        loading: false,
      };
    });

    setRows(updatedRows);
    setCountdown(REFRESH_INTERVAL_S);
    fetchingRef.current = false;
  }, [tickers]);

  useEffect(() => {
    if (!hydrated) return;
    setMarketOpen(isNYSEOpen());
    void fetchAll();
  }, [hydrated, fetchAll]);

  // Countdown timer
  useEffect(() => {
    if (!hydrated) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          void fetchAll();
          return REFRESH_INTERVAL_S;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hydrated, fetchAll]);

  if (!hydrated) {
    return (
      <div className="widget">
        <div className="widget-header">Giełda</div>
        <div className="widget-body">
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <button
            className={`btn-secondary ${tab === 'portfel' ? 'font-bold' : ''}`}
            style={tab === 'portfel' ? { borderColor: 'var(--a1)', color: 'var(--a1)' } : {}}
            onClick={() => setTab('portfel')}
          >
            Portfel
          </button>
          <button
            className={`btn-secondary ${tab === 'makro' ? 'font-bold' : ''}`}
            style={tab === 'makro' ? { borderColor: 'var(--a1)', color: 'var(--a1)' } : {}}
            onClick={() => setTab('makro')}
          >
            Makro
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: marketOpen ? 'var(--nom)' : 'var(--az)' }}
          />
          <span className="pill">{countdown}s</span>
        </div>
      </div>
      <div className="widget-body">
        {rows.length === 0
          ? Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)
          : rows.map((row) => {
              if (row.loading) {
                return <SkeletonRow key={row.config.sym} />;
              }

              const q = row.quote;
              const isUp = q ? q.chg >= 0 : true;

              return (
                <div key={row.config.sym} className="stock-row">
                  <div style={{ minWidth: '3.5rem' }}>
                    <div className="stock-ticker">{row.config.sym}</div>
                    <div className="stock-name">{row.config.name}</div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    {q?.closes && <Sparkline closes={q.closes} />}
                  </div>
                  <div className="stock-price text-right" style={{ minWidth: '4rem' }}>
                    {formatPrice(q?.price ?? null, row.config.sym)}
                  </div>
                  <div
                    className={`stock-change text-right ${isUp ? 'up' : 'dn'}`}
                    style={{ minWidth: '4rem' }}
                  >
                    {formatPercent(q?.chg ?? null)}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
