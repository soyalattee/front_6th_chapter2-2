import { useCallback, useEffect, useState } from 'react';
import { initialProducts, ProductWithUI } from '../datas/products';

export const useProducts = () => {
  const [products, setProducts] = useState<ProductWithUI[]>(() => {
    const saved = localStorage.getItem('products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialProducts;
      }
    }
    return initialProducts;
  });

  //판매상품에 새 상품을 추가
  const addProduct = useCallback((newProduct: Omit<ProductWithUI, 'id'>) => {
    const product: ProductWithUI = {
      ...newProduct,
      id: `p${Date.now()}`
    };
    setProducts(prev => [...prev, product]);
  }, []);

  // 판매상품 정보 수정
  const updateProduct = useCallback((productId: string, updates: Partial<ProductWithUI>) => {
    setProducts(prev => prev.map(product => (product.id === productId ? { ...product, ...updates } : product)));
  }, []);

  // 판매상품 삭제
  const deleteProduct = useCallback(
    (productId: string) => setProducts(prev => prev.filter(p => p.id !== productId)),
    []
  );

  // 상품 데이터 로컬 저장
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  return { products, addProduct, updateProduct, deleteProduct };
};
