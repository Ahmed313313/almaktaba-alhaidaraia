'use client';

import Link from 'next/link';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import { useCart } from './CartProvider';
import { formatPrice, getStockStatus } from '../lib/utils';
import { MiniRating } from './BookReviews';
import toast from 'react-hot-toast';
import styles from './BookCard.module.css';

export default function BookCard({ book }) {
  const { addItem } = useCart();
  const stockStatus = getStockStatus(book.stock);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (book.stock <= 0) return;
    addItem(book, 1);
    toast.success(`تمت إضافة "${book.title}" إلى السلة`, {
      style: {
        direction: 'rtl',
        fontFamily: 'var(--font-main)',
        background: 'var(--color-primary)',
        color: 'var(--color-text-on-dark)',
      },
      iconTheme: {
        primary: 'var(--color-secondary)',
        secondary: 'var(--color-primary)',
      },
    });
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
        {book.stock <= 3 && book.stock > 0 && (
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
          
          <button
            className={`${styles.addBtn} ${book.stock <= 0 ? styles.disabled : ''}`}
            onClick={handleAddToCart}
            disabled={book.stock <= 0}
            aria-label={`إضافة ${book.title} إلى السلة`}
            id={`add-to-cart-${book.slug}`}
          >
            <FiShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
}
