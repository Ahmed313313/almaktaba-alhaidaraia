'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiShoppingCart, FiEye, FiBell } from 'react-icons/fi';
import { useCart } from './CartProvider';
import { formatPrice, getStockStatus } from '../lib/utils';
import { MiniRating } from './BookReviews';
import toast from 'react-hot-toast';
import styles from './BookCard.module.css';

const LABEL_CONFIG = {
  'جديد':        { bg: '#27ae60', text: '🆕 جديد' },
  'الأكثر طلباً': { bg: '#e74c3c', text: '🔥 الأكثر طلباً' },
  'موصى به':     { bg: '#3498db', text: '⭐ موصى به' },
};

export default function BookCard({ book }) {
  const { addItem } = useCart();
  const stockStatus = getStockStatus(book.stock);
  const [wishSent, setWishSent] = useState(false);
  const labelCfg = book.label ? LABEL_CONFIG[book.label] : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (book.stock <= 0) return;
    addItem(book, 1);
    toast.success(`تمت إضافة "${book.title}" إلى السلة`, {
      style: { direction: 'rtl', fontFamily: 'var(--font-main)', background: 'var(--color-primary)', color: 'var(--color-text-on-dark)' },
      iconTheme: { primary: 'var(--color-secondary)', secondary: 'var(--color-primary)' },
    });
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishSent) return;
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id, bookTitle: book.title }),
      });
      setWishSent(true);
      toast.success('سنُعلمك عند توفر الكتاب! 🔔');
    } catch {
      toast.error('حدث خطأ');
    }
  };

  return (
    <div className={styles.card}>
      <Link href={`/book/${book.id}`} className={styles.imageWrapper}>
        <div className={styles.image}>
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderIcon}>📖</span>
            <span className={styles.placeholderTitle}>{book.title}</span>
          </div>
          {book.cover_url && book.cover_url !== '' && (
            <img
              src={book.cover_url}
              alt={`غلاف كتاب ${book.title}`}
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
        </div>
        <div className={styles.overlay}>
          <span className={styles.viewBtn}>
            <FiEye /> عرض التفاصيل
          </span>
        </div>

        {/* ملصق مخصص */}
        {labelCfg && (
          <span className={styles.labelTag} style={{ background: labelCfg.bg }}>
            {labelCfg.text}
          </span>
        )}

        {/* ملصقات المخزون */}
        {!labelCfg && book.stock <= 3 && book.stock > 0 && (
          <span className={styles.lowStockTag}>آخر {book.stock} نسخ!</span>
        )}
        {book.stock === 0 && (
          <span className={styles.outOfStockTag}>نفدت الكمية</span>
        )}
      </Link>

      <div className={styles.content}>
        <span className={styles.category}>{book.category}</span>
        <h3 className={styles.title}>
          <Link href={`/book/${book.id}`}>{book.title}</Link>
        </h3>
        <p className={styles.author}>{book.author}</p>
        <MiniRating bookId={book.id} />

        {/* عداد الاقتناء */}
        {book.purchase_count > 0 && (
          <span className={styles.purchaseCount}>
            🛍️ {book.purchase_count} شخص اقتناه
          </span>
        )}

        <div className={styles.footer}>
          <div className={styles.priceSection}>
            <span className={styles.price}>
              {formatPrice(book.price)}
              <span className={styles.currency}> د.ع</span>
            </span>
            <span className={`${styles.stock} ${styles[stockStatus.color]}`}>
              {stockStatus.label}
            </span>
          </div>

          {book.stock > 0 ? (
            <button
              className={styles.addBtn}
              onClick={handleAddToCart}
              aria-label={`إضافة ${book.title} إلى السلة`}
              id={`add-to-cart-${book.slug}`}
            >
              <FiShoppingCart />
            </button>
          ) : (
            <button
              className={`${styles.addBtn} ${wishSent ? styles.wishSent : styles.wishBtn}`}
              onClick={handleWishlist}
              aria-label="أريد هذا الكتاب"
              title={wishSent ? 'تم التسجيل!' : 'أريد هذا الكتاب'}
            >
              <FiBell />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
