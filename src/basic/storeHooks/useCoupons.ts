import { useCallback, useEffect, useState } from 'react';
import { Coupon } from '../../types';
import { initialCoupons } from '../datas/coupons';

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('coupons');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialCoupons;
      }
    }
    return initialCoupons;
  });

  const addCoupon = useCallback((newCoupon: Coupon) => {
    setCoupons(prev => [...prev, newCoupon]);
  }, []);

  const deleteCoupon = useCallback((couponCode: string) => {
    setCoupons(prev => prev.filter(c => c.code !== couponCode));
  }, []);

  // 쿠폰 데이터 로컬 저장
  useEffect(() => {
    localStorage.setItem('coupons', JSON.stringify(coupons));
  }, [coupons]);

  return { coupons, addCoupon, deleteCoupon };
};
