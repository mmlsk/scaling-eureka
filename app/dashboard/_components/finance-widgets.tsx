'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useHydration } from '@/hooks/useHydration';
import { PIZZA_INDEX } from '@/lib/providers/finance';
import type { PolymarketEvent, InsiderTrade, SECFiling, TrumpNewsItem } from '@/types/api';

type FinanceTab = 'polymarket' | 'insiders' | 'sec' | 'pizza' | 'trump';

const TAB_LABELS: Record<FinanceTab, string> = {
  polymarket: 'Polymarket',
  insiders: 'Insiders',
  sec: 'SEC',
  pizza: 'Pizza Index',
  trump: 'Trump Tracker',
};

function parseOutcomePrices(pricesStr: string): number[] {
  try {
    const parsed: string[] = JSON.parse(pricesStr);
    return parsed.map((p) => parseFloat(p) * 100);
  } catch {
    return [];
  }
}

async function fetchPolymarket(): Promise<PolymarketEvent[]> {
  const res = await fetch(
    'https://gamma-api.polymarket.com/events?limit=10&active=true&closed=false',
  );
  if (!res.ok) throw new Error('Polymarket fetch failed');
  return res.json();
}

export default function FinanceWidgets() {
  const hydrated = useHydration();
  const [tab, setTab] = useState<FinanceTab>('polymarket');

  const polymarketQuery = useQuery({
    queryKey: ['finance', 'polymarket'],
    queryFn: fetchPolymarket,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: hydrated && tab === 'polymarket',
  });

  if (!hydrated) {
    return (
      <div className="widget">
        <div className="widget-header">Finanse</div>
        <div className="widget-body">
          <div className="skeleton" style={{ height: '6rem', width: '100%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="widget">
      <div className="widget-header">
        <span>Finanse</span>
      </div>
      <div className="widget-body">
        {/* Tab switcher */}
        <div className="flex gap-1 mb-3 flex-wrap">
          {(Object.keys(TAB_LABELS) as FinanceTab[]).map((t) => (
            <button
              key={t}
              className={`btn-secondary text-[clamp(0.45rem,0.43rem+0.08vw,0.55rem)]`}
              style={
                tab === t
                  ? { borderColor: 'var(--a1)', color: 'var(--a1)', background: 'var(--a1d)' }
                  : {}
              }
              onClick={() => setTab(t)}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="max-h-52 overflow-y-auto">
          {tab === 'polymarket' && (
            <PolymarketTab
              events={polymarketQuery.data ?? []}
              loading={polymarketQuery.isLoading}
            />
          )}
          {tab === 'insiders' && (
            <InsidersTab insiders={[]} loading={false} />
          )}
          {tab === 'sec' && (
            <SECTab filings={[]} loading={false} />
          )}
          {tab === 'pizza' && <PizzaTab />}
          {tab === 'trump' && (
            <TrumpTab news={[]} loading={false} />
          )}
        </div>
      </div>
    </div>
  );
}

function PolymarketTab({
  events,
  loading,
}: {
  events: PolymarketEvent[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="skeleton" style={{ height: '2rem', width: '100%' }} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={{ color: 'var(--txm)' }} className="text-center py-3">
        Brak danych Polymarket
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.slice(0, 10).map((event, idx) => (
        <div
          key={idx}
          className="rounded p-2"
          style={{ background: 'var(--soff)', borderBottom: '1px solid var(--div)' }}
        >
          <div className="text-[clamp(0.55rem,0.52rem+0.1vw,0.65rem)] font-medium mb-1">
            {event.title}
          </div>
          {event.markets?.slice(0, 2).map((market, mIdx) => {
            const prices = parseOutcomePrices(market.outcomePrices);
            const yesPrice = prices[0] ?? 0;
            return (
              <div key={mIdx} className="flex justify-between items-center text-[clamp(0.5rem,0.48rem+0.1vw,0.6rem)]">
                <span className="truncate flex-1" style={{ color: 'var(--txm)' }}>
                  {market.question}
                </span>
                <span className="pill ml-1">{yesPrice.toFixed(0)}% Yes</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function InsidersTab({
  insiders,
  loading,
}: {
  insiders: InsiderTrade[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="skeleton" style={{ height: '1.5rem', width: '100%' }} />
        ))}
      </div>
    );
  }

  if (insiders.length === 0) {
    return (
      <div style={{ color: 'var(--txm)' }} className="text-center py-3">
        Brak danych insider trading. Wymagany klucz API Finnhub.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {insiders.map((trade, idx) => (
        <div key={idx} className="flex justify-between items-center py-1" style={{ borderBottom: '1px solid var(--div)' }}>
          <div>
            <span className="font-mono font-medium">{trade.symbol}</span>
            <span className="ml-1" style={{ color: 'var(--txm)' }}>{trade.name}</span>
          </div>
          <div className="text-right">
            <span className={`pill ${trade.type === 'P-Purchase' ? 'ok' : 'crit'}`}>
              {trade.type === 'P-Purchase' ? 'BUY' : 'SELL'}
            </span>
            <span className="ml-1 font-mono text-[clamp(0.5rem,0.48rem+0.1vw,0.6rem)]">
              ${(trade.value / 1000).toFixed(0)}K
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SECTab({
  filings,
  loading,
}: {
  filings: SECFiling[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="skeleton" style={{ height: '1.5rem', width: '100%' }} />
        ))}
      </div>
    );
  }

  if (filings.length === 0) {
    return (
      <div style={{ color: 'var(--txm)' }} className="text-center py-3">
        Brak danych SEC. Wymagany klucz API Finnhub.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filings.map((filing, idx) => (
        <div key={idx} className="flex justify-between items-center py-1" style={{ borderBottom: '1px solid var(--div)' }}>
          <div>
            <span className="font-mono font-medium">{filing.symbol}</span>
            <span className="pill ml-1">{filing.form}</span>
          </div>
          <div className="text-right" style={{ color: 'var(--txm)' }}>
            {filing.date}
          </div>
        </div>
      ))}
    </div>
  );
}

function PizzaTab() {
  return (
    <div className="space-y-1">
      <div className="text-[clamp(0.5rem,0.48rem+0.1vw,0.6rem)] mb-2" style={{ color: 'var(--txm)' }}>
        Cena margherity 32cm w wybranych miastach PL
      </div>
      {PIZZA_INDEX.map((item) => {
        const avgPrice = 30;
        const diff = item.price - avgPrice;
        const cls = diff > 1 ? 'crit' : diff < -1 ? 'ok' : 'warn';

        return (
          <div
            key={item.city}
            className="flex justify-between items-center py-1"
            style={{ borderBottom: '1px solid var(--div)' }}
          >
            <span>{item.city}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono">{item.price} PLN</span>
              <span className={`pill ${cls}`}>
                {diff > 0 ? '+' : ''}{diff} PLN
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrumpTab({
  news,
  loading,
}: {
  news: TrumpNewsItem[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="skeleton" style={{ height: '2rem', width: '100%' }} />
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div style={{ color: 'var(--txm)' }} className="text-center py-3">
        Brak wiadomości Trump. Wymagany klucz API Finnhub.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {news.slice(0, 10).map((item, idx) => (
        <a
          key={idx}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded p-2 transition-colors"
          style={{ background: 'var(--soff)', borderBottom: '1px solid var(--div)' }}
        >
          <div className="text-[clamp(0.55rem,0.52rem+0.1vw,0.65rem)] font-medium">
            {item.headline}
          </div>
          <div className="flex justify-between mt-0.5 text-[clamp(0.45rem,0.43rem+0.08vw,0.55rem)]" style={{ color: 'var(--txm)' }}>
            <span>{item.source}</span>
            <span>{new Date(item.datetime * 1000).toLocaleDateString('pl-PL')}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
