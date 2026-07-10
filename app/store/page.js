'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList, FiX } from 'react-icons/fi';
import BookCard from '../components/BookCard';
import { DEMO_BOOKS, CATEGORIES } from '../lib/supabase';
import styles from './page.module.css';

function StoreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [books, setBooks] = useState(DEMO_BOOKS);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch('/api/books')
      .then(res => res.json())
      .then(data => { if (data.success && data.books.length > 0) setBooks(data.books); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      result = result.filter(b => b.category === selectedCategory);
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    return result;
  }, [books, searchQuery, selectedCategory, sortBy]);

  const activeCategories = CATEGORIES.filter(cat =>
    books.some(b => b.category === cat.name)
  );

  return (
    <>
      {/* Page Header */}
      <section className={styles.pageHeader}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={styles.pageTitle}>
              {selectedCategory || 'جميع الكتب'}
            </h1>
            <p className={styles.pageSubtitle}>
              {selectedCategory
                ? `تصفح كتب قسم ${selectedCategory}`
                : 'تصفح مجموعتنا الكاملة من الكتب المتنوعة'}
            </p>
          </motion.div>
        </div>
      </section>

      <div className={`container ${styles.storeLayout}`}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="ابحث عن كتاب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              id="store-search"
            />
            {searchQuery && (
              <button className={styles.clearSearch} onClick={() => setSearchQuery('')} aria-label="مسح البحث">
                <FiX />
              </button>
            )}
          </div>

          <div className={styles.toolbarActions}>
            <button
              className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              id="filter-toggle"
            >
              <FiFilter /> فلترة
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
              id="sort-select"
            >
              <option value="newest">الأحدث</option>
              <option value="price-asc">السعر: من الأقل</option>
              <option value="price-desc">السعر: من الأعلى</option>
              <option value="name">الاسم</option>
            </select>

            <span className={styles.resultCount}>
              {filteredBooks.length} كتاب
            </span>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            className={styles.filters}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <button
              className={`${styles.filterChip} ${!selectedCategory ? styles.activeChip : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              الكل
            </button>
            {activeCategories.map(cat => (
              <button
                key={cat.slug}
                className={`${styles.filterChip} ${selectedCategory === cat.name ? styles.activeChip : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? '' : cat.name)}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </motion.div>
        )}

        {/* Active filters display */}
        {(selectedCategory || searchQuery) && (
          <div className={styles.activeFilters}>
            {selectedCategory && (
              <span className={styles.activeFilter}>
                {selectedCategory}
                <button onClick={() => setSelectedCategory('')}><FiX /></button>
              </span>
            )}
            {searchQuery && (
              <span className={styles.activeFilter}>
                بحث: &ldquo;{searchQuery}&rdquo;
                <button onClick={() => setSearchQuery('')}><FiX /></button>
              </span>
            )}
          </div>
        )}

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className={styles.booksGrid}>
            {filteredBooks.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <BookCard book={book} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>لا توجد نتائج</h3>
            <p>جرّب تغيير كلمات البحث أو التصنيف</p>
            <button
              className="btn btn-outline"
              onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="flex-center" style={{padding: '4rem'}}><div className="spinner" /></div>}>
      <StoreContent />
    </Suspense>
  );
}
