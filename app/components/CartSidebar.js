'use client';

import Link from 'next/link';
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from './CartProvider';
import { formatPrice } from '../lib/utils';
import styles from './CartSidebar.module.css';

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={() => setIsOpen(false)} />
      <aside className={styles.sidebar} id="cart-sidebar">
        <div className={styles.header}>
          <h3 className={styles.title}>
            <FiShoppingBag /> سلة المشتريات
            {totalItems > 0 && <span className={styles.count}>{totalItems}</span>}
          </h3>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="إغلاق السلة" id="close-cart">
            <FiX />
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🛒</span>
            <h4>السلة فارغة</h4>
            <p>لم تضف أي كتب بعد</p>
            <Link href="/store" className="btn btn-primary" onClick={() => setIsOpen(false)} id="browse-books-from-cart">
              تصفح الكتب
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map(item => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemImage}>
                    <span>📖</span>
                  </div>
                  <div className={styles.itemInfo}>
                    <h4 className={styles.itemTitle}>{item.title}</h4>
                    <p className={styles.itemAuthor}>{item.author}</p>
                    <div className={styles.itemPrice}>
                      {formatPrice(item.price)} <span>د.ع</span>
                    </div>
                  </div>
                  <div className={styles.itemActions}>
                    <div className={styles.quantity}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className={styles.qtyBtn}
                        aria-label="تقليل الكمية"
                      >
                        <FiMinus />
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className={styles.qtyBtn}
                        disabled={item.quantity >= item.stock}
                        aria-label="زيادة الكمية"
                      >
                        <FiPlus />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className={styles.removeBtn}
                      aria-label={`حذف ${item.title}`}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.total}>
                <span>المجموع الكلي:</span>
                <strong>{formatPrice(totalPrice)} <small>د.ع</small></strong>
              </div>
              <Link
                href="/checkout"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={() => setIsOpen(false)}
                id="proceed-to-checkout"
              >
                إتمام الطلب
              </Link>
              <button
                className={styles.continueBtn}
                onClick={() => setIsOpen(false)}
              >
                متابعة التسوق
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
