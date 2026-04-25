'use client';

import { useState, useEffect } from 'react';
import { useStocks, useMarketNews, useRecommendations, TICKERS } from '@/lib/queries/use-stocks';
import { useHydration } from '@/hooks/useHydration';
import { formatPrice, formatPercent } from '@/lib/utils/format';
import { Sparkline } from '@/components/widget-parts/sparkline';
import { WidgetTabs } from '@/components/widget-parts/widget-tabs';
import { LastUpdated } from '@/components/widget-parts/last-updated';
import type { QuoteResult } from '@/types/api';

type StockTab = 'portfel' | 'makro' | 'news' | 'reco';

function isNYSEOpen(): boolean {
  const nyDate = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
  );
  const day = nyDate.getDay();
  if (day === 0 || day === 6) return false;
  const totalMin = nyDate.getHours() * 60 + nyDate.getMinutes();
  return totalMin >= 570 && totalMin < 960;
}

function MarketStatus() {
  const [open, setOpen] = useState(false);
  const hydrated = useHydration();

  useEffect(() => {
    if (hydrated) setOpen(isNYSEOpen());
  }, [hydrated]);

  const now = new Date();
  const nyHour = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const totalMin = nyHour.getHours() * 60 + nyHour.getMinutes();

  let status = 'Zamkniete';
  let cls = 'var(--az)';
  if (open) {
    status = 'Otwarte';
    cls = 'var(--nom)';
  } else if (totalMin >= 240 && totalMin < 570) {
    status = 'Pre-market';
    cls = 'var(--a1)';
  } else if (totalMin >= 960 && totalMin < 1200) {
    status = 'After-hours';
    cls = 'var(--a1)';
  }

  return (
    <div className="flex items-center gap-1">
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ background: cls }}
      />
      <span style={{ fontSize: 'clamp(0.45rem, 0.43rem + 0.08vw, 0.52rem)', color: 'var(--txm)' }}>
        {status}
      </span>
    </div>
  );
}

function StockRow({ sym, name, quote }: { sym: string; name: string; quote: QuoteResult | null }) {
  const q = quote;
  const isUp = q ? q.chg >= 0 : true;

  return (
    <div className="stock-row" aria-label={`${sym}: ${formatPrice(q?.price ?? null, sym)}`}>
      <div style={{ minWidth: '3.5rem' }}>
        <div className="stock-ticker">{sym}</div>
        <div className="stock-name">{name}</div>
      </div>
      <div className="flex-1 flex justify-center">
        {q?.closes && <Sparkline data={q.closes} width={60} height={20} ariaLabel={`Trend ${sym}`} />}
      </div>
      <div className="stock-price text-right" style={{ minWidth: '4rem' }}>
        {formatPrice(q?.price ?? null, sym)}
      </div>
      <div
        className={`stock-change text-right ${isUp ? 'up' : 'dn'}`}
        style={{ minWidth: '4rem' }}
      >
        {formatPercent(q?.chg ?? null)}
      </div>
    </div>
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
    </div>
  );
}

function RecoBar({ buy, hold, sell }: { buy: number; hold: number; sell: number }) {
  const total = buy + hold + sell || 1;
  return (
    <div className="flex h-2 rounded-full overflow-hidden w-full" style={{ background: 'var(--soff)' }}>
      <div style={{ width: `${(buy / total) * 100}%`, background: 'var(--nom)' }} />
      <div style={{ width: `${(hold / total) * 100}%`, background: 'var(--a1)' }} />
      <div style={{ width: `${(sell / total) * 100}%`, background: 'var(--az)' }} />
    </div>
  );
}

const REFRESH_INTERVAL_S = 120;

export default function StocksWidget() {
  const hydrated = useHydration();
  const [tab, setTab] = useState<StockTab>('portfel');
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_S);

  const listTab = tab === 'portfel' || tab === 'makro' ? tab : 'portfel';
  const { data: rows, isLoading, dataUpdatedAt } = useStocks(listTab);
  const { data: news } = useMarketNews();
  const { data: recommendations } = useRecommendations(TICKERS[0]?.sym ?? 'NVDA');

  useEffect(() => {
    if (!hydrated) return;
    setCountdown(REFRESH_INTERVAL_S);
    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? REFRESH_INTERVAL_S : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [hydrated, rows]);

  const TABS: { key: StockTab; label: string }[] = [
    { key: 'portfel', label: 'Portfel' },
    { key: 'makro', label: 'Makro' },
    { key: 'news', label: 'News' },
    { key: 'reco', label: 'Reco' },
  ];

  if (!hydrated) {
    return (
      <div className="widget" aria-label="Widget: Gielda">
        <div className="widget-header">Gielda</div>
        <div className="widget-body">
          {Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="widget" aria-label="Widget: Gielda">
      <div className="widget-header">
        <span>Gielda</span>
        <div className="flex items-center gap-2">
          <MarketStatus />
          <span className="pill">{countdown}s</span>
        </div>
      </div>
      <div className="widget-body">
        <div style={{ marginBottom: '0.5rem' }}>
          <WidgetTabs tabs={TABS} activeTab={tab} onTabChange={setTab} />
        </div>

        {/* Stock list tabs */}
        {(tab === 'portfel' || tab === 'makro') && (
          <div className="max-h-52 overflow-y-auto">
            {isLoading || !rows
              ? Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)
              : rows.map((row) => (
                  <StockRow
                    key={row.config.sym}
                    sym={row.config.sym}
                    name={row.config.name}
                    quote={row.quote}
                  />
                ))}
          </div>
        )}

        {/* News tab */}
        {tab === 'news' && (
          <div className="max-h-52 overflow-y-auto space-y-1.5">
            {!news || news.length === 0 ? (
              <div style={{ color: 'var(--txm)' }} className="text-center py-3">
                Brak wiadomosci. Sprawdz klucz Finnhub API.
              </div>
            ) : (
              news.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded p-1.5"
                  style={{ background: 'var(--soff)', borderBottom: '1px solid var(--div)' }}
                  aria-label={`Wiadomosc: ${item.headline}`}
                >
                  <div style={{ fontSize: 'clamp(0.5rem, 0.48rem + 0.1vw, 0.6rem)', fontWeight: 500 }}>
                    {item.headline}
                  </div>
                  <div
                    className="flex justify-between mt-0.5"
                    style={{ fontSize: 'clamp(0.4rem, 0.38rem + 0.06vw, 0.48rem)', color: 'var(--txm)' }}
                  >
                    <span>{item.source}</span>
                    <span>{new Date(item.datetime * 1000).toLocaleDateString('pl-PL')}</span>
                  </div>
                </a>
              ))
            )}
          </div>
        )}

        {/* Recommendations tab */}
        {tab === 'reco' && (
          <div className="space-y-2">
            {!recommendations || recommendations.length === 0 ? (
              <div style={{ color: 'var(--txm)' }} className="text-center py-3">
                Brak rekomendacji. Sprawdz klucz Finnhub API.
              </div>
            ) : (
              <>
                <div
                  style={{ fontSize: 'clamp(0.5rem, 0.48rem + 0.1vw, 0.6rem)', color: 'var(--txm)' }}
                >
                  Rekomendacje analitykow ({TICKERS[0]?.sym ?? 'NVDA'})
                </div>
                {recommendations.map((r, idx) => (
                  <div key={idx}>
                    <div
                      className="flex justify-between mb-0.5"
                      style={{ fontSize: 'clamp(0.45rem, 0.43rem + 0.08vw, 0.52rem)', color: 'var(--txm)' }}
                    >
                      <span>{r.period}</span>
                      <span>
                        <span style={{ color: 'var(--nom)' }}>B:{r.buy + r.strongBuy}</span>
                        {' '}
                        <span style={{ color: 'var(--a1)' }}>H:{r.hold}</span>
                        {' '}
                        <span style={{ color: 'var(--az)' }}>S:{r.sell + r.strongSell}</span>
                      </span>
                    </div>
                    <RecoBar
                      buy={r.buy + r.strongBuy}
                      hold={r.hold}
                      sell={r.sell + r.strongSell}
                    />
                  </div>
                ))}
                <div
                  className="flex gap-3 justify-center mt-1"
                  style={{ fontSize: 'clamp(0.4rem, 0.38rem + 0.06vw, 0.48rem)', color: 'var(--txm)' }}
                >
                  <span><span className="inline-block w-2 h-2 rounded-full mr-0.5" style={{ background: 'var(--nom)' }} /> Kup</span>
                  <span><span className="inline-block w-2 h-2 rounded-full mr-0.5" style={{ background: 'var(--a1)' }} /> Trzymaj</span>
                  <span><span className="inline-block w-2 h-2 rounded-full mr-0.5" style={{ background: 'var(--az)' }} /> Sprzedaj</span>
                </div>
              </>
            )}
          </div>
        )}

        <LastUpdated timestamp={dataUpdatedAt || null} source="Yahoo/Finnhub" />
      </div>
    </div>
  );
}
