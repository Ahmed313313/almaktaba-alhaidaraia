'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('haidariya-cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading cart:', e);
    }
  }, []);

  // Save cart to localStorage on change — strip base64 to avoid QuotaExceededError
  useEffect(() => {
    try {
      if (items.length > 0) {
        const safeItems = items.map(item => ({
          ...item,
          // حذف الصور الكبيرة (base64) من التخزين المحلي
          cover_url: item.cover_url?.startsWith('data:') ? '' : (item.cover_url || ''),
          images: (item.images || []).filter(img => !img?.startsWith('data:')),
        }));
        localStorage.setItem('haidariya-cart', JSON.stringify(safeItems));
      } else {
        localStorage.removeItem('haidariya-cart');
      }
    } catch (e) {
      console.warn('Cart save error:', e.message);
    }
  }, [items]);

  const addItem = useCallback((book, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === book.id);
      if (existing) {
        return prev.map(item =>
          item.id === book.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, book.stock) }
            : item
        );
      }
      return [...prev, { ...book, quantity: Math.min(quantity, book.stock) }];
    });
  }, []);

  const removeItem = useCallback((bookId) => {
    setItems(prev => prev.filter(item => item.id !== bookId));
  }, []);

  const updateQuantity = useCallback((bookId, quantity) => {
    if (quantity <= 0) {
      removeItem(bookId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === bookId
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
