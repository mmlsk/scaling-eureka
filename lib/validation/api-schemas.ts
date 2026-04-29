import { z } from 'zod';

// ── Weather API Schemas ──
export const WeatherCurrentSchema = z.object({
  temperature_2m: z.number(),
  apparent_temperature: z.number(),
  relative_humidity_2m: z.number(),
  wind_speed_10m: z.number(),
  weather_code: z.number(),
  surface_pressure: z.number().optional(),
});

export const WeatherHourlySchema = z.object({
  time: z.array(z.string()),
  temperature_2m: z.array(z.number()),
  weather_code: z.array(z.number()),
  precipitation_probability: z.array(z.number()),
});

export const WeatherDailySchema = z.object({
  time: z.array(z.string()),
  weather_code: z.array(z.number()),
  temperature_2m_max: z.array(z.number()),
  temperature_2m_min: z.array(z.number()),
  sunrise: z.array(z.string()),
  sunset: z.array(z.string()),
});

export const WeatherExtendedSchema = z.object({
  current: WeatherCurrentSchema,
  hourly: WeatherHourlySchema,
  daily: WeatherDailySchema,
});

export const AirQualityCurrentSchema = z.object({
  pm2_5: z.number(),
  pm10: z.number(),
  nitrogen_dioxide: z.number(),
  sulphur_dioxide: z.number(),
  ozone: z.number(),
  carbon_monoxide: z.number(),
  us_aqi: z.number(),
  uv_index: z.number(),
});

export const AirQualityHourlySchema = z.object({
  time: z.array(z.string()),
  pm2_5: z.array(z.number()),
});

export const AirQualityExtendedSchema = z.object({
  current: AirQualityCurrentSchema,
  hourly: AirQualityHourlySchema,
});

export const UVResultSchema = z.object({
  uv: z.number(),
  uv_max: z.number(),
  safe_exposure_time: z.record(z.number().nullable()),
  sun_info: z.object({
    sun_times: z.object({
      sunrise: z.string(),
      sunset: z.string(),
    }),
  }),
});

export const UVExtendedSchema = z.object({
  uv: z.number(),
  uv_max: z.number(),
  safe_exposure_time: z.record(z.number().nullable()),
  sun_info: z.object({
    sun_times: z.object({
      sunrise: z.string(),
      sunset: z.string(),
    }),
  }),
});

// ── Stock API Schemas ──
export const QuoteResultSchema = z.object({
  price: z.number(),
  prev: z.number(),
  chg: z.number(),
  closes: z.array(z.number()).optional(),
  vol: z.number().optional(),
  provider: z.enum(['finnhub', 'alphavantage', 'polygon', 'yahoo']),
});

export const TickerConfigSchema = z.object({
  sym: z.string(),
  name: z.string(),
});

export const MacroConfigSchema = z.object({
  sym: z.string(),
  name: z.string(),
});

// ── FRED API Schemas ──
export const FREDObservationSchema = z.object({
  date: z.string(),
  value: z.string().nullable(),
});

export const FREDResponseSchema = z.object({
  observations: z.array(FREDObservationSchema),
});

// ── EIA API Schemas ──
export const EIADatumSchema = z.object({
  period: z.string(),
  value: z.string().nullable(),
});

export const EIAResponseSchema = z.object({
  response: z.object({
    data: z.array(EIADatumSchema),
  }),
});

// ── Finance API Schemas ──
export const PolymarketEventSchema = z.object({
  title: z.string(),
  markets: z.array(z.object({
    question: z.string(),
    outcomePrices: z.string(),
  })).optional(),
});

export const InsiderTradeSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  shares: z.number(),
  type: z.string(),
  value: z.number(),
  date: z.string(),
});

export const SECFilingSchema = z.object({
  symbol: z.string(),
  form: z.string(),
  date: z.string(),
  url: z.string(),
});

export const TrumpNewsItemSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  source: z.string(),
  datetime: z.number(),
  url: z.string(),
});

// ── Calendar API Schemas ──
export const GoogleCalEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  end: z.string(),
  source: z.literal('google'),
});

export const NagerHolidaySchema = z.object({
  localName: z.string(),
  date: z.string(),
});

// ── AI API Schemas ──
export const AIAssistantRequestSchema = z.object({
  message: z.string(),
  context: z.record(z.unknown()).optional(),
});

export const AIAssistantResponseSchema = z.object({
  response: z.string(),
  sources: z.array(z.object({
    type: z.string(),
    content: z.string(),
  })).optional(),
});

// ── Generic API Response Schemas ──
export const PaginatedResponseSchema = z.object({
  data: z.array(z.unknown()),
  cursor: z.string().nullable(),
  hasMore: z.boolean(),
});

export const YahooChartResultSchema = z.object({
  meta: z.object({
    symbol: z.string(),
    regularMarketPrice: z.number(),
    chartPreviousClose: z.number(),
    previousClose: z.number(),
    regularMarketVolume: z.number(),
  }),
  indicators: z.object({
    quote: z.array(z.object({
      close: z.array(z.number().nullable()),
    })),
  }),
});

export const FinnhubQuoteSchema = z.object({
  c: z.number(), // current price
  pc: z.number(), // previous close
  dp: z.number(), // change percent
});

// ── Type Guards ──
export function isWeatherExtended(data: unknown): data is z.infer<typeof WeatherExtendedSchema> {
  return WeatherExtendedSchema.safeParse(data).success;
}

export function isAirQualityExtended(data: unknown): data is z.infer<typeof AirQualityExtendedSchema> {
  return AirQualityExtendedSchema.safeParse(data).success;
}

export function isUVExtended(data: unknown): data is z.infer<typeof UVExtendedSchema> {
  return UVExtendedSchema.safeParse(data).success;
}

export function isQuoteResult(data: unknown): data is z.infer<typeof QuoteResultSchema> {
  return QuoteResultSchema.safeParse(data).success;
}

export function isFREDResponse(data: unknown): data is z.infer<typeof FREDResponseSchema> {
  return FREDResponseSchema.safeParse(data).success;
}

export function isEIAResponse(data: unknown): data is z.infer<typeof EIAResponseSchema> {
  return EIAResponseSchema.safeParse(data).success;
}

// ── Validation Functions ──
export function validateWeatherAPI(data: unknown): z.infer<typeof WeatherExtendedSchema> {
  return WeatherExtendedSchema.parse(data);
}

export function validateAirQualityAPI(data: unknown): z.infer<typeof AirQualityExtendedSchema> {
  return AirQualityExtendedSchema.parse(data);
}

export function validateQuoteResult(data: unknown): z.infer<typeof QuoteResultSchema> {
  return QuoteResultSchema.parse(data);
}

export function validateFREDResponse(data: unknown): z.infer<typeof FREDResponseSchema> {
  return FREDResponseSchema.parse(data);
}

export function validateEIAResponse(data: unknown): z.infer<typeof EIAResponseSchema> {
  return EIAResponseSchema.parse(data);
}