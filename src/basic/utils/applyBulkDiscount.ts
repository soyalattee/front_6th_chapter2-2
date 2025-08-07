/*
 * Apply extra 5% discount for bulk purchase, but cap total discount at 50%.
 * baseRate : 기존 할인율(0 ~ 1)
 * discountLimit : 할인율 상한값(기본값 0.5)
 * return   : 보정된 할인율(최대 0.5)
 */
export const applyBulkDiscount = (baseRate: number, discountLimit: number = 0.5): number => {
  const safeRate = baseRate < 0 ? 0 : baseRate; // 음수 보호
  return Math.min(safeRate + 0.05, discountLimit);
};
