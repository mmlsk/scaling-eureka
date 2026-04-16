import { NextResponse } from 'next/server';
import {
  fetchWeatherForecast,
  fetchAirQuality,
  fetchUV,
  fetchIMGWAlerts,
  fetchRainViewer,
} from '@/lib/providers/weather';

interface WeatherAPIResponse {
  forecast: Awaited<ReturnType<typeof fetchWeatherForecast>> | null;
  airQuality: Awaited<ReturnType<typeof fetchAirQuality>> | null;
  uv: Awaited<ReturnType<typeof fetchUV>> | null;
  alerts: Awaited<ReturnType<typeof fetchIMGWAlerts>> | null;
  radar: Awaited<ReturnType<typeof fetchRainViewer>> | null;
  errors: string[];
}

export async function GET(): Promise<NextResponse<WeatherAPIResponse>> {
  const openuvKey = process.env.OPENUV_API_KEY;
  const errors: string[] = [];

  const [forecastResult, airQualityResult, uvResult, alertsResult, radarResult] =
    await Promise.allSettled([
      fetchWeatherForecast(),
      fetchAirQuality(),
      openuvKey
        ? fetchUV(undefined, undefined, openuvKey)
        : Promise.reject(new Error('OPENUV_API_KEY not configured')),
      fetchIMGWAlerts(),
      fetchRainViewer(),
    ]);

  const forecast =
    forecastResult.status === 'fulfilled' ? forecastResult.value : null;
  if (forecastResult.status === 'rejected') {
    errors.push(`forecast: ${(forecastResult.reason as Error).message}`);
  }

  const airQuality =
    airQualityResult.status === 'fulfilled' ? airQualityResult.value : null;
  if (airQualityResult.status === 'rejected') {
    errors.push(`airQuality: ${(airQualityResult.reason as Error).message}`);
  }

  const uv = uvResult.status === 'fulfilled' ? uvResult.value : null;
  if (uvResult.status === 'rejected') {
    errors.push(`uv: ${(uvResult.reason as Error).message}`);
  }

  const alerts =
    alertsResult.status === 'fulfilled' ? alertsResult.value : null;
  if (alertsResult.status === 'rejected') {
    errors.push(`alerts: ${(alertsResult.reason as Error).message}`);
  }

  const radar =
    radarResult.status === 'fulfilled' ? radarResult.value : null;
  if (radarResult.status === 'rejected') {
    errors.push(`radar: ${(radarResult.reason as Error).message}`);
  }

  return NextResponse.json({
    forecast,
    airQuality,
    uv,
    alerts,
    radar,
    errors,
  });
}
