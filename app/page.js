'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiBookOpen, FiTruck, FiShield, FiStar, FiEye } from 'react-icons/fi';
import BookCard from './components/BookCard';
import { DEMO_BOOKS, CATEGORIES } from './lib/supabase';
import styles from './page.module.css';

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    // جلب الكتب من الـ API
    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.books.length > 0) setBooks(data.books);
        setBooksLoading(false);
      })
      .catch(() => { setBooksLoading(false); });

    // عداد الزوار
    const visited = sessionStorage.getItem('visited');
    if (!visited) {
      fetch('/api/visitors', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success) setVisitorCount(data.total);
          sessionStorage.setItem('visited', 'true');
        })
        .catch(() => { });
    } else {
      fetch('/api/visitors')
        .then(res => res.json())
        .then(data => { if (data.success) setVisitorCount(data.total); })
        .catch(() => { });
    }
  }, []);

  const featuredBooks = books.filter(b => b.stock > 0).slice(0, 8);
  const newArrivals = [...books].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4);

  const categoriesWithCount = CATEGORIES.map(cat => ({
    ...cat,
    count: books.filter(b => b.category === cat.name).length
  })).filter(cat => cat.count > 0);

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroPattern} />
        <div className={`container ${styles.heroContent}`}>
          <motion.div
            className={styles.heroText}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className={styles.heroTag}>📚 مرحباً بكم في</span>
            <h1 className={styles.heroTitle}>
              المكتبة <span className={styles.heroGold}>الحيدرية</span>
            </h1>
            <p className={styles.heroDesc}>
              وجهتكم الأولى لاقتناء أفضل الكتب الدينية والفكرية والأدبية والثقافية.
              نوفر لكم تشكيلة واسعة من العناوين المميزة مع خدمة توصيل سريعة لجميع المحافظات العراقية.
            </p>
            <div className={styles.heroActions}>
              <Link href="/store" className="btn btn-primary btn-lg" id="hero-browse-btn">
                تصفح الكتب <FiArrowLeft />
              </Link>
              <Link href="/about" className="btn btn-outline btn-lg" id="hero-about-btn">
                من نحن
              </Link>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <strong>{books.length}+</strong>
                <span>عنوان متوفر</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <strong>18</strong>
                <span>محافظة</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <strong>24/7</strong>
                <span>طلب أونلاين</span>
              </div>
              {visitorCount > 0 && (
                <>
                  <div className={styles.statDivider} />
                  <div className={styles.stat}>
                    <strong><FiEye style={{ marginLeft: '4px', verticalAlign: 'middle' }} /> {visitorCount.toLocaleString('ar-IQ')}</strong>
                    <span>زائر</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
          <motion.div
            className={styles.heroVisual}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className={styles.heroBookStack}>
              <div className={styles.heroBook} style={{ '--i': 0 }}>📕</div>
              <div className={styles.heroBook} style={{ '--i': 1 }}>📗</div>
              <div className={styles.heroBook} style={{ '--i': 2 }}>📘</div>
              <div className={styles.heroBook} style={{ '--i': 3 }}>📙</div>
            </div>
          </motion.div>
        </div>
        <div className={styles.heroWave}>
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L48 55C96 50 192 40 288 42.7C384 45.3 480 60 576 65.3C672 70.7 768 66.3 864 57.3C960 48.3 1056 34.7 1152 32C1248 29.3 1344 37.7 1392 41.8L1440 46V120H0V60Z" fill="var(--color-bg)" />
          </svg>
        </div>
      </section>

      {/* Features Bar */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.featuresGrid}>
            <motion.div className={styles.feature} whileHover={{ y: -5 }}>
              <div className={styles.featureIcon}><FiTruck /></div>
              <div>
                <h4>توصيل لكل العراق</h4>
                <p>نوصل لجميع المحافظات</p>
              </div>
            </motion.div>
            <motion.div className={styles.feature} whileHover={{ y: -5 }}>
              <div className={styles.featureIcon}><FiShield /></div>
              <div>
                <h4>كتب منتقاة بعناية</h4>
                <p>جودة واختيار مميز</p>
              </div>
            </motion.div>
            <motion.div className={styles.feature} whileHover={{ y: -5 }}>
              <div className={styles.featureIcon}><FiBookOpen /></div>
              <div>
                <h4>تشكيلة واسعة</h4>
                <p>كل الأقسام متوفرة</p>
              </div>
            </motion.div>
            <motion.div className={styles.feature} whileHover={{ y: -5 }}>
              <div className={styles.featureIcon}><FiStar /></div>
              <div>
                <h4>تشكيلة واسعة ومتنوعة</h4>
                <p>لجميع الأذواق والاهتمامات</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.section}>
        <div className="container">
          <div className="section-title">
            <h2>تصفح حسب التصنيف</h2>
            <p>اختر التصنيف الذي يناسب اهتماماتك</p>
          </div>
          <div className={styles.categoriesGrid}>
            {categoriesWithCount.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                viewport={{ once: true }}
              >
                <Link href={`/store?category=${encodeURIComponent(cat.name)}`} className={styles.categoryCard} id={`category-${cat.slug}`}>
                  <span className={styles.categoryIcon}>{cat.icon}</span>
                  <h4 className={styles.categoryName}>{cat.name}</h4>
                  <span className={styles.categoryCount}>{cat.count} كتاب</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className={styles.section} style={{ background: 'var(--color-bg-warm)' }}>
        <div className="container">
          <div className="section-title">
            <h2>كتب مميزة</h2>
            <p>اختيارات المكتبة الحيدرية لكم</p>
          </div>
          <div className={styles.booksGrid}>
            {booksLoading ? (
              <div className="flex-center" style={{ gridColumn: '1/-1', padding: '3rem', flexDirection: 'column', gap: 12 }}>
                <div className="spinner" />
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>جاري تحميل الكتب...</p>
              </div>
            ) : featuredBooks.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <BookCard book={book} />
              </motion.div>
            ))}
          </div>
          <div className={styles.viewAll}>
            <Link href="/store" className="btn btn-secondary btn-lg" id="view-all-books">
              عرض جميع الكتب <FiArrowLeft />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className={styles.section}>
        <div className="container">
          <div className="section-title">
            <h2>وصل حديثاً</h2>
            <p>آخر الإضافات إلى مكتبتنا</p>
          </div>
          <div className={styles.booksGrid}>
            {booksLoading ? (
              <div className="flex-center" style={{ gridColumn: '1/-1', padding: '3rem', flexDirection: 'column', gap: 12 }}>
                <div className="spinner" />
              </div>
            ) : newArrivals.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <BookCard book={book} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className="container">
          <motion.div
            className={styles.ctaContent}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>هل تبحث عن كتاب معين؟</h2>
            <p>تواصل معنا مباشرة عبر واتساب</p>
            <a
              href="https://wa.me/9647725754850?text=مرحباً، أبحث عن كتاب..."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
              id="cta-whatsapp"
            >
              تواصل عبر واتساب
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
