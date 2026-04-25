export const DEFAULT_LOCATION = {
  latitude: parseFloat(process.env.NEXT_PUBLIC_LATITUDE ?? '53.43'),
  longitude: parseFloat(process.env.NEXT_PUBLIC_LONGITUDE ?? '14.55'),
  city: process.env.NEXT_PUBLIC_CITY ?? 'Szczecin',
  country: process.env.NEXT_PUBLIC_COUNTRY ?? 'PL',
  timezone: process.env.NEXT_PUBLIC_TIMEZONE ?? 'Europe/Warsaw',
} as const;
