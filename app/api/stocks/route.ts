import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fetchQuote, TICKERS, MACRO_LIST } from '@/lib/providers/stocks';
import type { QuoteResult } from '@/types/api';

interface StockQuoteItem {
  sym: string;
  name: string;
  quote: QuoteResult | null;
  error: string | null;
}

interface StocksAPIResponse {
  tickers: StockQuoteItem[];
  macro: StockQuoteItem[];
  timestamp: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<StocksAPIResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type'); // 'tickers', 'macro', or null (both)

  const finnhub = process.env.FINNHUB_API_KEY;
  const alphaVantage = process.env.ALPHA_VANTAGE_API_KEY;
  const polygon = process.env.POLYGON_API_KEY;

  const keys = {
    finnhub,
    alphaVantage,
    polygon,
  };

  const fetchTickerQuotes = async (
    list: typeof TICKERS,
  ): Promise<StockQuoteItem[]> => {
    const results = await Promise.allSettled(
      list.map((ticker) => fetchQuote(ticker.sym, keys)),
    );

    return list.map((ticker, i) => {
      const result = results[i];
      if (result.status === 'fulfilled') {
        return {
          sym: ticker.sym,
          name: ticker.name,
          quote: result.value,
          error: null,
        };
      }
      return {
        sym: ticker.sym,
        name: ticker.name,
        quote: null,
        error: (result.reason as Error).message,
      };
    });
  };

  let tickers: StockQuoteItem[] = [];
  let macro: StockQuoteItem[] = [];

  if (type === 'macro') {
    macro = await fetchTickerQuotes(MACRO_LIST);
  } else if (type === 'tickers') {
    tickers = await fetchTickerQuotes(TICKERS);
  } else {
    [tickers, macro] = await Promise.all([
      fetchTickerQuotes(TICKERS),
      fetchTickerQuotes(MACRO_LIST),
    ]);
  }

  return NextResponse.json({
    tickers,
    macro,
    timestamp: new Date().toISOString(),
  });
}
