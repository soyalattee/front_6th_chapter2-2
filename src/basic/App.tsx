import { useState, useCallback, useEffect } from 'react';
import { CartItem, Coupon, Product } from '../types';
import { ProductWithUI } from './datas/products';
import { initialCoupons } from './datas/coupons';
import Header from './components/Header';
import NotificationContainer from './components/NotificationContainer';
import AdminPage from './components/AdminPage';
import CustomerPage from './components/CustomerPage';
import { useNotification } from './hooks/useNotification';
import { useProducts } from './storeHooks/useProducts';
import { useCarts } from './storeHooks/useCarts';

const App = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { cart, addToCart, removeFromCart, updateCartQuantity, clearCart } = useCarts();

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

  // UI관련 상태값들
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { notifications, addNotification, removeNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // 가격 포맷팅 + 품절 표시 (분리 필요)
  const formatPrice = (price: number, productId?: string): string => {
    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product && getRemainingStock(product) <= 0) {
        return 'SOLD OUT';
      }
    }

    if (isAdmin) {
      return `${price.toLocaleString()}원`;
    }

    return `₩${price.toLocaleString()}`;
  };

  // 할인 적용 가능한 최대 할인율 계산: 수량 할인 + 대량 구매 시 추가 5% 할인, 최대 50% 할인
  const getMaxApplicableDiscount = (item: CartItem): number => {
    const { discounts } = item.product;
    const { quantity } = item;

    // 수량 할인
    const baseDiscount = discounts.reduce((maxDiscount, discount) => {
      return quantity >= discount.quantity && discount.rate > maxDiscount ? discount.rate : maxDiscount;
    }, 0);

    const hasBulkPurchase = cart.some(cartItem => cartItem.quantity >= 10);

    if (hasBulkPurchase) {
      return Math.min(baseDiscount + 0.05, 0.5); // 대량 구매 시 추가 5% 할인, 최대 50% 할인
    }

    return baseDiscount;
  };

  //할인 적용된 상품 가격 계산 (e.g. 사과 3개 할인 적용 가격)
  const calculateItemTotal = (item: CartItem): number => {
    const { price } = item.product;
    const { quantity } = item;
    const discount = getMaxApplicableDiscount(item);

    return Math.round(price * quantity * (1 - discount));
  };

  // 장바구니 총 가격 계산 (할인 적용 전, 후)
  const calculateCartTotal = (): {
    totalBeforeDiscount: number;
    totalAfterDiscount: number;
  } => {
    let totalBeforeDiscount = 0;
    let totalAfterDiscount = 0;

    cart.forEach(item => {
      const itemPrice = item.product.price * item.quantity;
      totalBeforeDiscount += itemPrice;
      totalAfterDiscount += calculateItemTotal(item);
    });

    if (selectedCoupon) {
      if (selectedCoupon.discountType === 'amount') {
        totalAfterDiscount = Math.max(0, totalAfterDiscount - selectedCoupon.discountValue);
      } else {
        totalAfterDiscount = Math.round(totalAfterDiscount * (1 - selectedCoupon.discountValue / 100));
      }
    }

    return {
      totalBeforeDiscount: Math.round(totalBeforeDiscount),
      totalAfterDiscount: Math.round(totalAfterDiscount)
    };
  };

  //상품 재고 수량 확인
  const getRemainingStock = (product: Product): number => {
    const cartItem = cart.find(item => item.product.id === product.id);
    const remaining = product.stock - (cartItem?.quantity || 0);

    return remaining;
  };

  // 쿠폰 데이터 로컬 저장
  useEffect(() => {
    localStorage.setItem('coupons', JSON.stringify(coupons));
  }, [coupons]);

  // 검색어 디바운스 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAddToCart = useCallback(
    (product: ProductWithUI) => {
      const remainingStock = getRemainingStock(product);
      if (remainingStock <= 0) {
        addNotification('재고가 부족합니다!', 'error');
        return;
      }

      addToCart(product);
      addNotification('장바구니에 담았습니다', 'success');
    },
    [cart, addNotification, getRemainingStock]
  );

  // 장바구니 수량 업데이트
  const updateQuantity = useCallback(
    (productId: string, newQuantity: number) => {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
      }

      const maxStock = product.stock;
      if (newQuantity > maxStock) {
        addNotification(`재고는 ${maxStock}개까지만 있습니다.`, 'error');
        return;
      }

      // 장바구니 수량 업데이트
      updateCartQuantity(productId, newQuantity);
    },
    [products, removeFromCart, addNotification, getRemainingStock]
  );

  // 쿠폰 적용
  const applyCoupon = useCallback(
    (coupon: Coupon) => {
      const currentTotal = calculateCartTotal().totalAfterDiscount;

      if (currentTotal < 10000 && coupon.discountType === 'percentage') {
        addNotification('percentage 쿠폰은 10,000원 이상 구매 시 사용 가능합니다.', 'error');
        return;
      }

      setSelectedCoupon(coupon);
      addNotification('쿠폰이 적용되었습니다.', 'success');
    },
    [addNotification, calculateCartTotal]
  );

  // 주문 완료
  const completeOrder = useCallback(() => {
    const orderNumber = `ORD-${Date.now()}`;
    addNotification(`주문이 완료되었습니다. 주문번호: ${orderNumber}`, 'success');
    clearCart();
    setSelectedCoupon(null);
  }, [addNotification, clearCart]);

  // --------------- UI 데이터 -------------------------------------------------------------

  // 장바구니 총 가격 계산
  const totals = calculateCartTotal();

  // 검색어로 상품 필터링
  const filteredProducts = debouncedSearchTerm
    ? products.filter(
        product =>
          product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      )
    : products;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 알림 메시지 컴포넌트 */}
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      {/* 헤더 컴포넌트 */}
      <Header
        isAdmin={isAdmin}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setIsAdmin={setIsAdmin}
        cart={cart}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isAdmin ? (
          <AdminPage
            coupons={coupons}
            addNotification={addNotification}
            setCoupons={setCoupons}
            setSelectedCoupon={setSelectedCoupon}
            selectedCoupon={selectedCoupon}
            formatPrice={formatPrice}
            products={products}
            addProduct={addProduct}
            updateProduct={updateProduct}
            deleteProduct={deleteProduct}
          />
        ) : (
          <CustomerPage
            filteredProducts={filteredProducts}
            debouncedSearchTerm={debouncedSearchTerm}
            getRemainingStock={getRemainingStock}
            formatPrice={formatPrice}
            addToCart={handleAddToCart}
            products={products}
            cart={cart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            coupons={coupons}
            selectedCoupon={selectedCoupon}
            totals={totals}
            completeOrder={completeOrder}
            calculateItemTotal={calculateItemTotal}
            applyCoupon={applyCoupon}
            setSelectedCoupon={setSelectedCoupon}
          />
        )}
      </main>
    </div>
  );
};

export default App;
