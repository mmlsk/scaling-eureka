export interface QuoteResult {
  price: number;
  prev: number;
  chg: number;
  closes?: number[];
  vol?: number;
  provider: 'finnhub' | 'alphavantage' | 'polygon' | 'yahoo';
}

export interface TickerConfig {
  sym: string;
  name: string;
}

export interface MacroConfig {
  sym: string;
  name: string;
}

export interface WeatherForecastResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

export interface AirQualityResponse {
  current: {
    pm2_5: number;
    pm10: number;
    uv_index: number;
  };
}

export interface UVResponse {
  result: {
    uv: number;
    uv_max: number;
  };
}

export interface PolymarketEvent {
  title: string;
  markets?: {
    question: string;
    outcomePrices: string;
  }[];
}

export interface InsiderTrade {
  symbol: string;
  name: string;
  shares: number;
  type: string;
  value: number;
  date: string;
}

export interface SECFiling {
  symbol: string;
  form: string;
  date: string;
  url: string;
}

export interface TrumpNewsItem {
  headline: string;
  summary: string;
  source: string;
  datetime: number;
  url: string;
}

export interface GoogleCalEvent {
  id: string;
  title: string;
  date: string;
  end: string;
  source: 'google';
}

export interface NagerHoliday {
  localName: string;
  date: string;
}

export interface AIAssistantRequest {
  message: string;
  context?: Record<string, unknown>;
}

export interface AIAssistantResponse {
  response: string;
  sources?: { type: string; content: string }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  cursor: string | null;
  hasMore: boolean;
}

export interface YahooChartResult {
  meta: {
    symbol: string;
    regularMarketPrice: number;
    chartPreviousClose: number;
    previousClose: number;
    regularMarketVolume: number;
  };
  indicators: {
    quote: { close: (number | null)[] }[];
  };
}

export interface FinnhubQuote {
  c: number;
  pc: number;
  dp: number;
}
