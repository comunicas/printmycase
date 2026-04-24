export type SafeZonePreset = {
  insetX?: string;
  width?: string;
  top: string;
  height: string;
  radius: string;
  bottomRadius: string;
  mobileRadius?: string;
  mobileBottomRadius?: string;
};

export const SAFE_ZONE_PRESETS: Record<string, SafeZonePreset> = {
  "iphone-12-pro-max": { insetX: "5%", width: "40%", top: "3.5%", height: "calc(17% + 30px)", radius: "1.5rem", bottomRadius: "3.5rem", mobileRadius: "1rem", mobileBottomRadius: "2.5rem" },
  "iphone-15-pro-max": { insetX: "5%", width: "40%", top: "3.05%", height: "calc(15.2% + 20px)", radius: "1.5rem", bottomRadius: "3.8rem", mobileRadius: "1rem", mobileBottomRadius: "2.6rem" },
  "iphone-17-pro": { insetX: "8.8%", top: "3.5%", height: "calc(17% + 10px)", radius: "2.2rem", bottomRadius: "2.2rem", mobileRadius: "1.15rem", mobileBottomRadius: "1.15rem" },
  "iphone-17-pro-max": { insetX: "8.8%", top: "3.5%", height: "calc(17% + 10px)", radius: "2.2rem", bottomRadius: "2.2rem", mobileRadius: "1.15rem", mobileBottomRadius: "1.15rem" },
  "iphone-17-air": { insetX: "8.8%", top: "3.5%", height: "calc(8.5% + 5px)", radius: "2.2rem", bottomRadius: "2.2rem", mobileRadius: "1.15rem", mobileBottomRadius: "1.15rem" },
  "redmi-note14-pro": { insetX: "30%", width: "40%", top: "3.5%", height: "calc(17% + 20px)", radius: "1.5rem", bottomRadius: "3.5rem", mobileRadius: "1rem", mobileBottomRadius: "2.5rem" },
  "poco-x6-pro": { insetX: "8.8%", top: "3.5%", height: "calc(17% + 10px)", radius: "2.2rem", bottomRadius: "2.2rem", mobileRadius: "1.15rem", mobileBottomRadius: "1.15rem" },
};

export const DEFAULT_SAFE_ZONE_PRESET: SafeZonePreset = { insetX: "5%", width: "40%", top: "3.5%", height: "calc(17% + 20px)", radius: "1.5rem", bottomRadius: "3.5rem" };

export function getSafeZonePreset(deviceSlug?: string): SafeZonePreset {
  return (deviceSlug && SAFE_ZONE_PRESETS[deviceSlug]) || DEFAULT_SAFE_ZONE_PRESET;
}
