import { useCallback, useEffect, useState } from 'react';
import { CartItem } from '../../types';
import { ProductWithUI } from '../datas/products';

export const useCarts = () => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // 장바구니에 추가
  const addToCart = useCallback((product: ProductWithUI) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        return prevCart.map(item => (item.product.id === product.id ? { ...item, quantity: newQuantity } : item));
      }

      return [...prevCart, { product, quantity: 1 }];
    });
  }, []);

  // 장바구니에서 삭제
  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  }, []);

  // 장바구니 수량 업데이트
  const updateCartQuantity = useCallback((productId: string, newQuantity: number) => {
    setCart(prevCart =>
      prevCart.map(item => (item.product.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  }, []);

  // 장바구니 비우기
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // 장바구니 데이터 로컬 저장
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  return { cart, addToCart, removeFromCart, updateCartQuantity, clearCart };
};
