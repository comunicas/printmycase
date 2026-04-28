export interface ShippingRegion {
  name: string;
  states: string[];
  priceCents: number;
  deliveryDays: string;
}

export const shippingRegions: ShippingRegion[] = [
  { name: "Sudeste",      states: ["SP","RJ","MG","ES"],                        priceCents: 0, deliveryDays: "5 a 7 dias úteis" },
  { name: "Sul",          states: ["PR","SC","RS"],                              priceCents: 0, deliveryDays: "7 a 10 dias úteis" },
  { name: "Centro-Oeste", states: ["GO","MT","MS","DF"],                         priceCents: 0, deliveryDays: "8 a 12 dias úteis" },
  { name: "Nordeste",     states: ["BA","SE","AL","PE","PB","RN","CE","PI","MA"],priceCents: 0, deliveryDays: "10 a 15 dias úteis" },
  { name: "Norte",        states: ["AM","PA","AC","RO","RR","AP","TO"],          priceCents: 0, deliveryDays: "12 a 18 dias úteis" },
];

/**
 * Map of the first 2 digits of CEP → state abbreviation.
 * Source: https://bfraga.com/blog/faixa-cep-estados
 */
const zipPrefixToState: Record<string, string> = {
  // SP
  "01": "SP", "02": "SP", "03": "SP", "04": "SP", "05": "SP",
  "06": "SP", "07": "SP", "08": "SP", "09": "SP",
  "10": "SP", "11": "SP", "12": "SP", "13": "SP", "14": "SP",
  "15": "SP", "16": "SP", "17": "SP", "18": "SP", "19": "SP",
  // RJ
  "20": "RJ", "21": "RJ", "22": "RJ", "23": "RJ", "24": "RJ",
  "25": "RJ", "26": "RJ", "27": "RJ", "28": "RJ",
  // ES
  "29": "ES",
  // MG
  "30": "MG", "31": "MG", "32": "MG", "33": "MG", "34": "MG",
  "35": "MG", "36": "MG", "37": "MG", "38": "MG", "39": "MG",
  // BA
  "40": "BA", "41": "BA", "42": "BA", "43": "BA", "44": "BA",
  "45": "BA", "46": "BA", "47": "BA", "48": "BA",
  // SE
  "49": "SE",
  // PE
  "50": "PE", "51": "PE", "52": "PE", "53": "PE", "54": "PE",
  "55": "PE", "56": "PE",
  // AL
  "57": "AL",
  // PB
  "58": "PB",
  // RN
  "59": "RN",
  // CE
  "60": "CE", "61": "CE", "62": "CE", "63": "CE",
  // PI
  "64": "PI",
  // MA
  "65": "MA",
  // PA
  "66": "PA", "67": "PA",
  // AP (68 prefix — PA and AP share; we handle AP via 3-digit check)
  "68": "PA",
  // AM
  "69": "AM",
  // AC (prefixed by 69, actually 699xx)
  // DF / GO
  "70": "DF", "71": "DF", "72": "DF", "73": "DF",
  "74": "GO", "75": "GO", "76": "GO",
  // TO
  "77": "TO",
  // MT
  "78": "MT",
  // MS
  "79": "MS",
  // PR
  "80": "PR", "81": "PR", "82": "PR", "83": "PR", "84": "PR",
  "85": "PR", "86": "PR", "87": "PR",
  // SC
  "88": "SC", "89": "SC",
  // RS
  "90": "RS", "91": "RS", "92": "RS", "93": "RS", "94": "RS",
  "95": "RS", "96": "RS", "97": "RS", "98": "RS", "99": "RS",
  // RO
  // RR
};

// Additional specific mappings
const additionalMappings: { prefix: string; state: string }[] = [
  { prefix: "76.8", state: "RO" },
  { prefix: "76.9", state: "RO" },
  { prefix: "69.3", state: "RR" },
  { prefix: "69.0", state: "AM" },
  { prefix: "69.1", state: "AM" },
  { prefix: "69.8", state: "AC" },
  { prefix: "69.9", state: "AC" },
  { prefix: "68.9", state: "AP" },
];

export function getStateByZip(zip: string): string | null {
  const clean = zip.replace(/\D/g, "");
  if (clean.length < 2) return null;

  // Check 3-digit matches first for accuracy
  const threeDigit = clean.substring(0, 3);
  for (const m of additionalMappings) {
    const mClean = m.prefix.replace(/\D/g, "");
    if (threeDigit.startsWith(mClean) || clean.startsWith(mClean)) {
      return m.state;
    }
  }

  return zipPrefixToState[clean.substring(0, 2)] ?? null;
}

export const ALLOWED_REGIONS = ["Sudeste", "Sul", "Centro-Oeste", "Nordeste", "Norte"];

export interface ShippingResult {
  region: string;
  state: string;
  priceCents: number;
  allowed: boolean;
  deliveryDays?: string;
}

export function getShippingByZip(zip: string): ShippingResult | null {
  const state = getStateByZip(zip);
  if (!state) return null;

  const region = shippingRegions.find((r) => r.states.includes(state));
  if (!region) return null;

  return {
    region: region.name,
    state,
    priceCents: region.priceCents,
    allowed: ALLOWED_REGIONS.includes(region.name),
    deliveryDays: region.deliveryDays,
  };
}
