/**
 * Solar Circadian Theme Glide
 * Computes astronomical solar elevation and circadian night warmth factor
 * purely using offline mathematical trigonometry from local time and day-of-year.
 * 0 GPS calls, 0 network requests, 0 paid APIs.
 */

export interface SolarStatus {
  elevationDegrees: number;
  warmthFactor: number; // 0.0 (daylight crisp) to 1.0 (midnight warm amber)
  phase: "day" | "golden_hour" | "twilight" | "night";
  description: string;
}

/**
 * Calculates approximate solar elevation angle (-90 to +90 degrees)
 * from the user's local wall clock and calendar date.
 */
export function calculateSolarElevation(date: Date = new Date()): number {
  const hours = date.getHours() + date.getMinutes() / 60;
  
  // Approximate day of year
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffDays = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  
  // Solar declination approximation: delta = -23.44 * cos(360/365 * (N + 10))
  const declination = -23.44 * Math.cos(((2 * Math.PI) / 365) * (diffDays + 10));
  
  // Solar hour angle: H = 15 * (hours - 12) in degrees
  const hourAngle = 15 * (hours - 12);
  
  // Mid-latitude baseline (approx 35 degrees)
  const latRad = (35 * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  const hourRad = (hourAngle * Math.PI) / 180;
  
  // sin(alpha) = sin(lat)*sin(dec) + cos(lat)*cos(dec)*cos(H)
  const sinAlpha = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourRad);
  const alphaRad = Math.asin(Math.max(-1, Math.min(1, sinAlpha)));
  
  return Number(((alphaRad * 180) / Math.PI).toFixed(2));
}

/**
 * Maps solar elevation to a circadian warmth factor (0.0 to 1.0).
 * - Full daytime (> 15°): 0.0
 * - Golden hour (5° to 15°): 0.0 -> 0.3
 * - Twilight (-6° to 5°): 0.3 -> 0.7
 * - Night (< -6°): 0.7 -> 1.0
 */
export function calculateCircadianWarmth(date: Date = new Date()): number {
  const elevation = calculateSolarElevation(date);

  if (elevation >= 15) {
    return 0.0;
  }
  if (elevation >= 5) {
    // Golden hour transition
    return Number(((15 - elevation) / 10 * 0.3).toFixed(3));
  }
  if (elevation >= -6) {
    // Twilight transition
    return Number((0.3 + ((5 - elevation) / 11) * 0.4).toFixed(3));
  }
  // Deep night
  const nightDepth = Math.min(1.0, 0.7 + Math.min(0.3, Math.abs(elevation + 6) / 30 * 0.3));
  return Number(nightDepth.toFixed(3));
}

/**
 * Returns full diagnostic summary of the current solar phase.
 */
export function getSolarCircadianStatus(date: Date = new Date()): SolarStatus {
  const elevation = calculateSolarElevation(date);
  const warmth = calculateCircadianWarmth(date);

  let phase: SolarStatus["phase"] = "day";
  let description = "Daylight: crisp contrast display";

  if (elevation < -6) {
    phase = "night";
    description = "Deep night: amber blue-light reduction active";
  } else if (elevation < 5) {
    phase = "twilight";
    description = "Twilight: gentle warm glide underway";
  } else if (elevation < 15) {
    phase = "golden_hour";
    description = "Golden hour: soft evening spectrum";
  }

  return {
    elevationDegrees: elevation,
    warmthFactor: warmth,
    phase,
    description,
  };
}
