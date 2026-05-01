import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WeatherWidget from '@/app/dashboard/_components/weather-widget';

// Mock useWeather hook
vi.mock('@/lib/queries/use-weather', () => ({
  useWeather: () => ({
    data: {
      weather: {
        current: {
          temperature_2m: 20,
          apparent_temperature: 18,
          relative_humidity_2m: 60,
          wind_speed_10m: 10,
          weather_code: 0,
        },
        hourly: {
          temperature_2m: [20, 21, 22],
          weather_code: [0, 1, 2],
          precipitation_probability: [10, 20, 30],
          time: ['2026-05-01T00:00', '2026-05-01T01:00', '2026-05-01T02:00'],
        },
        daily: {
          sunrise: ['2026-05-01T05:00:00Z'],
          sunset: ['2026-05-01T20:00:00Z'],
          time: ['2026-05-01'],
          weather_code: [0],
          temperature_2m_max: [25],
          temperature_2m_min: [15],
        },
      },
      airQuality: {
        current: {
          pm2_5: 20,
          uv_index: 3,
        },
      },
      uvData: { uv: 3, uv_max: 5 },
      fetchedAt: new Date().toISOString(),
    },
    isLoading: false,
    error: null,
  }),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('WeatherWidget', () => {
  it('renders without crashing', () => {
    renderWithProviders(<WeatherWidget />);
    expect(screen.getAllByLabelText(/Widget: Pogoda/i).length).toBeGreaterThan(0);
  });

  it('uses WidgetShell with shadcn Card', () => {
    renderWithProviders(<WeatherWidget />);
    const widget = screen.getAllByLabelText(/Widget: Pogoda/i)[0];
    expect(widget).toHaveClass('rounded-lg');
  });

  it('displays temperature', () => {
    renderWithProviders(<WeatherWidget />);
    const tempElements = screen.getAllByText('20°C');
    expect(tempElements.length).toBeGreaterThan(0);
    // Check that at least one is the main temperature (font-bold)
    const mainTemp = tempElements.find(el => el.classList.contains('font-bold'));
    expect(mainTemp).toBeInTheDocument();
  });

  it('displays AQ and UV badges', () => {
    renderWithProviders(<WeatherWidget />);
    const aqBadges = screen.getAllByText(/AQ: Dobra/i);
    expect(aqBadges.length).toBeGreaterThan(0);
    const uvBadges = screen.getAllByText(/UV: 3.0/i);
    expect(uvBadges.length).toBeGreaterThan(0);
  });
});
