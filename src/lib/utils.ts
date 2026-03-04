import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BRAND_MAP: [RegExp, string][] = [
  [/\biphone\b/i, "Apple"],
  [/\bgalaxy\b/i, "Samsung"],
  [/\bmoto\b/i, "Motorola"],
  [/\b(redmi|poco|xiaomi)\b/i, "Xiaomi"],
];

export function extractBrand(productName: string): string {
  for (const [re, brand] of BRAND_MAP) {
    if (re.test(productName)) return brand;
  }
  return "Outro";
}
