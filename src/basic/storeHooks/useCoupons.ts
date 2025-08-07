import { useCallback } from 'react';
import { Coupon } from '../../types';
import { initialCoupons } from '../datas/coupons';
import { useLocalStorage } from '../utils/hooks/useLocalStorage';

export const useCoupons = () => {
  const [coupons, setCoupons] = useLocalStorage<Coupon[]>('coupons', initialCoupons);

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
