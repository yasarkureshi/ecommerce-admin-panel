import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("mm-cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("mm-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // selectedSize: { label: "50ml", price: 999 } or null
  const addToCart = (product, quantity = 1, selectedSize = null) => {
    const cartKey = selectedSize ? `${product.id}_${selectedSize.label}` : product.id;
    const price = selectedSize ? selectedSize.price : product.price;
    const size = selectedSize ? selectedSize.label : (product.size || "");

    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartKey === cartKey);
      if (existing) {
        return prev.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, price, size, quantity, cartKey }];
    });
  };

  const removeFromCart = (cartKey) => {
    setCartItems((prev) => prev.filter((item) => (item.cartKey || item.id) !== cartKey));
  };

  const updateQuantity = (cartKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        (item.cartKey || item.id) === cartKey ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
