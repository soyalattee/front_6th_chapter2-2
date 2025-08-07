import { useCallback } from 'react';
import { Coupon } from '../../types';
import { initialCoupons } from '../datas/coupons';
import { useSyncedLocalStorage } from '../utils/hooks/useSyncedLocalStorage';

export const useCoupons = () => {
  const [coupons, setCoupons] = useSyncedLocalStorage<Coupon[]>('coupons', initialCoupons);

  const addCoupon = useCallback(
    (newCoupon: Coupon) => {
      setCoupons(prev => [...prev, newCoupon]);
    },
    [setCoupons]
  );

  const deleteCoupon = useCallback(
    (couponCode: string) => {
      setCoupons(prev => prev.filter(c => c.code !== couponCode));
    },
    [setCoupons]
  );

  return { coupons, addCoupon, deleteCoupon };
};
