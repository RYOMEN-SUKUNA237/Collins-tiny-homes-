/**
 * North American country ISO codes (excluding USA)
 */
export const NORTH_AMERICA_COUNTRIES = [
  'CA', 'MX', 'GL', 'PM', 'BM', 'BZ', 'CR', 'SV', 'GT', 'HN', 'NI', 'PA',
  'AG', 'BS', 'BB', 'CU', 'DM', 'DO', 'GD', 'HT', 'JM', 'KN', 'LC', 'VC', 'TT',
  'PR', 'VI', 'VG', 'KY', 'MS', 'TC', 'AI', 'AW', 'CW', 'BQ', 'MF', 'SX', 'BL', 'GP', 'MQ'
];

/**
 * Returns the shipping fee based on Mapbox reverse geocoded country code.
 */
export function getShippingFeeByCountryCode(countryCode: string | null | undefined): number {
  if (!countryCode) return 0;
  const cc = countryCode.trim().toUpperCase();
  if (cc === 'US' || cc === 'USA') return 1500;
  if (NORTH_AMERICA_COUNTRIES.includes(cc)) return 2000;
  return 3500;
}

/**
 * Returns a deterministic delivery fee based on text input (mostly for mock sidebar inputs).
 * The homeType parameter is kept for API compatibility.
 */
export function getDeterministicShippingFee(address: string, _homeType?: string): number {
  if (!address || address.trim().length === 0) return 0;
  
  const clean = address.trim().toLowerCase();
  
  // Check if it's a USA address
  // USA state codes/indicators
  const usIndicators = [
    'usa', 'united states', 'u.s.a.', ' us', ', al', ', ak', ', az', ', ar', ', ca', ', co', ', ct', ', de', ', fl', ', ga', 
    ', hi', ', id', ', il', ', in', ', ia', ', ks', ', ky', ', la', ', me', ', md', ', ma', ', mi', ', mn', ', ms', 
    ', mo', ', mt', ', ne', ', nv', ', nh', ', nj', ', nm', ', ny', ', nc', ', nd', ', oh', ', ok', ', or', ', pa', 
    ', ri', ', sc', ', sd', ', tn', ', tx', ', ut', ', vt', ', va', ', wa', ', wv', ', wi', ', wy', 'seattle', 'denver', 
    'austin', 'atlanta', 'boston'
  ];
  
  if (usIndicators.some(ind => clean.endsWith(ind) || clean.includes(ind + ' ') || clean.includes(ind + ','))) {
    return 1500;
  }
  
  // Check North America outside US
  const naIndicators = [
    'canada', 'mexico', 'greenland', 'bermuda', 'belize', 'costa rica', 'el salvador', 'guatemala', 'honduras', 
    'nicaragua', 'panama', 'bahamas', 'barbados', 'cuba', 'dominica', 'dominican republic', 'grenada', 'haiti', 
    'jamaica', 'trinidad', 'tobago', 'puerto rico'
  ];
  if (naIndicators.some(ind => clean.includes(ind))) {
    return 2000;
  }
  
  // Check Rest of the world (Europe, Asia, etc.)
  const rowIndicators = [
    'uk', 'united kingdom', 'london', 'france', 'paris', 'germany', 'berlin', 'japan', 'tokyo', 'australia', 
    'sydney', 'china', 'brazil', 'italy', 'spain', 'europe', 'asia', 'africa'
  ];
  if (rowIndicators.some(ind => clean.includes(ind))) {
    return 3500;
  }
  
  // Fallback default: if it's a standard address, treat it as US since it is a US-based site
  return 1500;
}
