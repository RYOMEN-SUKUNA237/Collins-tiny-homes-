/**
 * Returns a flat $1,500 delivery fee for all non-empty addresses.
 * The homeType parameter is kept for API compatibility.
 */
export function getDeterministicShippingFee(address: string, _homeType?: string): number {
  if (!address || address.trim().length === 0) return 0;
  // Flat nationwide delivery fee
  return 1500;
}
