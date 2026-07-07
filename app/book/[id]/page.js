'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiMinus, FiPlus, FiShare2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../../components/CartProvider';
import { DEMO_BOOKS } from '../../lib/supabase';
import { formatPrice, getStockStatus } from '../../lib/utils';
import BookReviews from '../../components/BookReviews';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function BookPage({ params }) {
  const resolvedParams = use(params);
  const bookId = resolvedParams.id;
  const [book, setBook] = useState(null);
  const [allBooks, setAllBooks] = useState(DEMO_BOOKS);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.books.length > 0) {
          setAllBooks(data.books);
          const found = data.books.find(b => b.id === bookId);
          setBook(found || null);
        } else {
          setBook(DEMO_BOOKS.find(b => b.id === bookId) || null);
        }
        setLoading(false);
      })
      .catch(() => {
        setBook(DEMO_BOOKS.find(b => b.id === bookId) || null);
        setLoading(false);
      });
  }, [bookId]);

  if (loading) {
    return (
      <div className="flex-center" style={{ padding: '6rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>الكتاب غير موجود</h3>
          <p>عذراً، لم نجد الكتاب الذي تبحث عنه</p>
          <Link href="/store" className="btn btn-primary">العودة للمتجر</Link>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(book.stock);
  const relatedBooks = allBooks.filter(b => b.category === book.category && b.id !== book.id).slice(0, 4);

  // Collect all images: cover_url + images array
  const allImages = [];
  if (book.cover_url && book.cover_url !== '') allImages.push(book.cover_url);
  if (book.images && Array.isArray(book.images)) {
    book.images.forEach(img => {
      if (img && img !== '' && !allImages.includes(img)) allImages.push(img);
    });
  }

  const handleAddToCart = () => {
    if (book.stock <= 0) return;
    addItem(book, quantity);
    toast.success(`تمت إضافة "${book.title}" (${quantity} نسخة) إلى السلة`, {
      style: {
        direction: 'rtl',
        fontFamily: 'var(--font-main)',
        background: 'var(--color-primary)',
        color: 'var(--color-text-on-dark)',
      },
      iconTheme: { primary: 'var(--color-secondary)', secondary: 'var(--color-primary)' },
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `${book.title} - ${book.author} | المكتبة الحيدرية`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ الرابط');
    }
  };

  const nextImage = () => {
    setActiveImageIndex(prev => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex(prev => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <>
      <div className={`container ${styles.breadcrumb}`}>
        <Link href="/">الرئيسية</Link>
        <span>/</span>
        <Link href="/store">المتجر</Link>
        <span>/</span>
        <Link href={`/store?category=${encodeURIComponent(book.category)}`}>{book.category}</Link>
        <span>/</span>
        <span className={styles.current}>{book.title}</span>
      </div>

      <div className={`container ${styles.bookDetail}`}>
        <motion.div
          className={styles.imageSection}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.mainImage}>
            {allImages.length > 0 ? (
              <>
                <img
                  src={allImages[activeImageIndex]}
                  alt={`${book.title} - صورة ${activeImageIndex + 1}`}
                  className={styles.bookImage}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }}
                />
                <div className={styles.imagePlaceholder} style={{ display: 'none' }}>
                  <span>📖</span>
                  <p>{book.title}</p>
                </div>
                {allImages.length > 1 && (
                  <>
                    <button onClick={prevImage} className={`${styles.imageNavBtn} ${styles.prevBtn}`} aria-label="الصورة السابقة">
                      <FiChevronRight />
                    </button>
                    <button onClick={nextImage} className={`${styles.imageNavBtn} ${styles.nextBtn}`} aria-label="الصورة التالية">
                      <FiChevronLeft />
                    </button>
                    <div className={styles.imageCounter}>
                      {activeImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className={styles.imagePlaceholder}>
                <span>📖</span>
                <p>{book.title}</p>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className={styles.thumbnailStrip}>
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  className={`${styles.thumbnail} ${idx === activeImageIndex ? styles.activeThumbnail : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={img} alt={`صورة مصغرة ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          className={styles.infoSection}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className={styles.category}>{book.category}</span>
          <h1 className={styles.title}>{book.title}</h1>
          <p className={styles.author}>
            <strong>المؤلف:</strong> {book.author}
          </p>
          {book.publisher && (
            <p className={styles.publisher}>
              <strong>دار النشر:</strong> {book.publisher}
            </p>
          )}

          <div className={styles.priceBox}>
            <div className={styles.price}>
              {formatPrice(book.price)}
              <span className={styles.currency}>د.ع</span>
            </div>
            <div className={`${styles.stockBadge} ${styles[stockStatus.color]}`}>
              {stockStatus.label}
            </div>
          </div>

          {book.description && (
            <div className={styles.description}>
              <h3>عن الكتاب</h3>
              <p>{book.description}</p>
            </div>
          )}

          {book.stock > 0 && (
            <div className={styles.actions}>
              <div className={styles.quantityControl}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="تقليل الكمية"
                >
                  <FiMinus />
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(book.stock, q + 1))}
                  disabled={quantity >= book.stock}
                  aria-label="زيادة الكمية"
                >
                  <FiPlus />
                </button>
              </div>

              <button
                className="btn btn-primary btn-lg"
                onClick={handleAddToCart}
                id="add-to-cart-detail"
                style={{ flex: 1 }}
              >
                <FiShoppingCart /> أضف إلى السلة
              </button>
            </div>
          )}

          {book.stock <= 0 && (
            <div className={styles.outOfStock}>
              <p>نفدت الكمية حالياً</p>
              <a
                href={`https://wa.me/9647725754850?text=مرحباً، أريد الاستفسار عن توفر كتاب: ${book.title}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <FaWhatsapp /> استفسر عن التوفر
              </a>
            </div>
          )}

          <div className={styles.extraActions}>
            <a
              href={`https://wa.me/9647725754850?text=مرحباً، أريد طلب كتاب: ${book.title} - ${book.author} | السعر: ${formatPrice(book.price)} د.ع`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
              id="order-via-whatsapp"
            >
              <FaWhatsapp /> اطلب عبر واتساب
            </a>
            <button onClick={handleShare} className={styles.shareBtn} id="share-book">
              <FiShare2 /> مشاركة
            </button>
          </div>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <div className="container">
        <BookReviews bookId={book.id} />
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className={styles.related}>
          <div className="container">
            <div className="section-title">
              <h2>كتب ذات صلة</h2>
              <p>قد تعجبك أيضاً</p>
            </div>
            <div className={styles.relatedGrid}>
              {relatedBooks.map((b) => (
                <Link key={b.id} href={`/book/${b.id}`} className={styles.relatedCard}>
                  <div className={styles.relatedImage}>
                    {b.cover_url ? (
                      <img src={b.cover_url} alt={b.title} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                    ) : null}
                    <span style={b.cover_url ? { display: 'none' } : {}}>📖</span>
                  </div>
                  <div className={styles.relatedInfo}>
                    <h4>{b.title}</h4>
                    <p>{b.author}</p>
                    <span className={styles.relatedPrice}>{formatPrice(b.price)} د.ع</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
