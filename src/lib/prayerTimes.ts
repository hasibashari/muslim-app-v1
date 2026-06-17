import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan';

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export function calculatePrayerTimes(
  date: Date,
  latitude: number,
  longitude: number,
  _timezoneOffset: number // Ignored, handled by JS Date local methods
): PrayerTimes {
  const coords = new Coordinates(latitude, longitude);
  const params = CalculationMethod.Singapore(); // Fajr: 20, Isha: 18 (Standard Kemenag)
  
  const pt = new AdhanPrayerTimes(coords, date, params);

  const formatTime = (d: Date): string => {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  return {
    Fajr: formatTime(pt.fajr),
    Sunrise: formatTime(pt.sunrise),
    Dhuhr: formatTime(pt.dhuhr),
    Asr: formatTime(pt.asr),
    Maghrib: formatTime(pt.maghrib),
    Isha: formatTime(pt.isha),
  };
}
