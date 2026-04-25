import type {
  WeatherForecastResponse,
  AirQualityResponse,
  UVResponse,
} from '@/types/api';
import type { IMGWAlert } from '@/types/state';

import { DEFAULT_LOCATION } from '@/lib/config/location';

// ── Config ──
const LAT = DEFAULT_LOCATION.latitude;
const LON = DEFAULT_LOCATION.longitude;
const TIMEZONE = DEFAULT_LOCATION.timezone;

// ── WMO Weather Code Labels (Polish) ──
const WMO_LABELS: Record<number, string> = {
  0: 'Bezchmurnie',
  1: 'Prawie bezchmurnie',
  2: 'Czesciowo pochmurno',
  3: 'Pochmurno',
  45: 'Mgla',
  48: 'Szadz',
  51: 'Mzawka lekka',
  53: 'Mzawka umiarkowana',
  55: 'Mzawka gesta',
  56: 'Mzawka marznaca lekka',
  57: 'Mzawka marznaca gesta',
  61: 'Deszcz lekki',
  63: 'Deszcz umiarkowany',
  65: 'Deszcz silny',
  66: 'Deszcz marznacy lekki',
  67: 'Deszcz marznacy silny',
  71: 'Snieg lekki',
  73: 'Snieg umiarkowany',
  75: 'Snieg silny',
  77: 'Ziarna sniegu',
  80: 'Przelotny deszcz lekki',
  81: 'Przelotny deszcz umiarkowany',
  82: 'Przelotny deszcz silny',
  85: 'Przelotny snieg lekki',
  86: 'Przelotny snieg silny',
  95: 'Burza',
  96: 'Burza z gradem lekkim',
  99: 'Burza z gradem silnym',
};

const WMO_ICONS: Record<number, string> = {
  0: '\u2600\uFE0F',
  1: '\uD83C\uDF24\uFE0F',
  2: '\u26C5',
  3: '\u2601\uFE0F',
  45: '\uD83C\uDF2B\uFE0F',
  48: '\uD83C\uDF2B\uFE0F',
  51: '\uD83C\uDF26\uFE0F',
  53: '\uD83C\uDF26\uFE0F',
  55: '\uD83C\uDF26\uFE0F',
  56: '\u2744\uFE0F',
  57: '\u2744\uFE0F',
  61: '\uD83C\uDF27\uFE0F',
  63: '\uD83C\uDF27\uFE0F',
  65: '\uD83C\uDF27\uFE0F',
  66: '\uD83C\uDF28\uFE0F',
  67: '\uD83C\uDF28\uFE0F',
  71: '\uD83C\uDF28\uFE0F',
  73: '\uD83C\uDF28\uFE0F',
  75: '\uD83C\uDF28\uFE0F',
  77: '\uD83C\uDF28\uFE0F',
  80: '\uD83C\uDF26\uFE0F',
  81: '\uD83C\uDF27\uFE0F',
  82: '\uD83C\uDF27\uFE0F',
  85: '\uD83C\uDF28\uFE0F',
  86: '\uD83C\uDF28\uFE0F',
  95: '\u26C8\uFE0F',
  96: '\u26C8\uFE0F',
  99: '\u26C8\uFE0F',
};

// ── IMGW Raw Alert Shape ──
interface IMGWRawAlert {
  woj?: string;
  opis?: string;
  zjawisko?: string;
  [key: string]: unknown;
}

// ── RainViewer Response Shape ──
interface RainViewerResponse {
  version: string;
  generated: number;
  host: string;
  radar: {
    past: { path: string; time: number }[];
    nowcast: { path: string; time: number }[];
  };
  satellite?: {
    infrared: { path: string; time: number }[];
  };
}

/**
 * Fetch weather forecast from Open-Meteo API.
 */
export async function fetchWeatherForecast(
  lat: number = LAT,
  lon: number = LON,
  timezone: string = TIMEZONE,
): Promise<WeatherForecastResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    timezone,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    forecast_days: '7',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Open-Meteo forecast failed: ${res.status} ${res.statusText}`);
  }

  const data: WeatherForecastResponse = await res.json();
  return data;
}

/**
 * Fetch air quality data from Open-Meteo Air Quality API.
 */
export async function fetchAirQuality(
  lat: number = LAT,
  lon: number = LON,
): Promise<AirQualityResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'pm2_5,pm10,uv_index',
  });

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Open-Meteo air quality failed: ${res.status} ${res.statusText}`);
  }

  const data: AirQualityResponse = await res.json();
  return data;
}

/**
 * Fetch UV index data from OpenUV API.
 */
export async function fetchUV(
  lat: number = LAT,
  lon: number = LON,
  apiKey: string,
): Promise<UVResponse> {
  const url = `https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lon}`;
  const res = await fetch(url, {
    headers: { 'x-access-token': apiKey },
  });

  if (!res.ok) {
    throw new Error(`OpenUV API failed: ${res.status} ${res.statusText}`);
  }

  const data: UVResponse = await res.json();
  return data;
}

/**
 * Fetch IMGW meteorological alerts and filter for zachodniopomorskie.
 */
export async function fetchIMGWAlerts(): Promise<IMGWAlert[]> {
  const url = 'https://danepubliczne.imgw.pl/api/data/warningsmeteo';
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`IMGW alerts failed: ${res.status} ${res.statusText}`);
  }

  const raw: IMGWRawAlert[] = await res.json();

  const filtered: IMGWAlert[] = raw
    .filter((alert) => {
      const voivodeship = (alert.woj ?? '').toLowerCase();
      return voivodeship.includes('zachodniopomorskie');
    })
    .map((alert) => ({
      voivodeship: alert.woj,
      description: alert.opis,
      phenomena: alert.zjawisko,
    }));

  return filtered;
}

/**
 * Fetch radar data from RainViewer API.
 */
export async function fetchRainViewer(): Promise<RainViewerResponse> {
  const url = 'https://api.rainviewer.com/public/weather-maps.json';
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`RainViewer API failed: ${res.status} ${res.statusText}`);
  }

  const data: RainViewerResponse = await res.json();
  return data;
}

/**
 * Map WMO weather code to Polish label.
 */
export function weatherLabel(code: number): string {
  return WMO_LABELS[code] ?? `Kod ${code}`;
}

/**
 * Map WMO weather code to emoji icon.
 */
export function weatherIcon(code: number): string {
  return WMO_ICONS[code] ?? '\u2753';
}

export const WeatherProviders = {
  fetchWeatherForecast,
  fetchAirQuality,
  fetchUV,
  fetchIMGWAlerts,
  fetchRainViewer,
  weatherLabel,
  weatherIcon,
  LAT,
  LON,
  TIMEZONE,
} as const;
