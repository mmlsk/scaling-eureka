import type { StateCreator } from 'zustand';
import type { WeatherData, AirQuality, UVData, IMGWAlert } from '@/types/state';

export interface WeatherSlice {
  weather: WeatherData | null;
  airQuality: AirQuality | null;
  uvData: UVData | null;
  imgwAlerts: IMGWAlert[];
  setWeather: (data: WeatherData) => void;
  setAirQuality: (data: AirQuality) => void;
  setUV: (data: UVData) => void;
  setAlerts: (alerts: IMGWAlert[]) => void;
}

export const createWeatherSlice: StateCreator<WeatherSlice, [], [], WeatherSlice> = (set) => ({
  weather: null,
  airQuality: null,
  uvData: null,
  imgwAlerts: [],

  setWeather: (data) => set({ weather: data }),
  setAirQuality: (data) => set({ airQuality: data }),
  setUV: (data) => set({ uvData: data }),
  setAlerts: (alerts) => set({ imgwAlerts: alerts }),
});
