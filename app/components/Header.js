'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiSearch, FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from './CartProvider';
import ThemeToggle from './ThemeToggle';
import styles from './Header.module.css';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, setIsOpen: setCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setShowSuggestions(false);
  }, [pathname]);

  // تحميل الكتب مرة واحدة عند فتح البحث
  useEffect(() => {
    if (isSearchOpen && allBooks.length === 0) {
      fetch('/api/books').then(r => r.json()).then(d => {
        if (d.success) setAllBooks(d.books);
      }).catch(() => {});
    }
  }, [isSearchOpen]);

  // فلترة الاقتراحات
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = searchQuery.trim().toLowerCase();
    const results = allBooks.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    ).slice(0, 6);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
  }, [searchQuery, allBooks]);

  // إغلاق الاقتراحات عند الضغط خارجها
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/store?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectSuggestion = (book) => {
    setShowSuggestions(false);
    setSearchQuery('');
    setIsSearchOpen(false);
    router.push(`/book/${book.id}`);
  };

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/store', label: 'المتجر' },
    { href: '/about', label: 'من نحن' },
    { href: '/contact', label: 'تواصل معنا' },
  ];

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.headerInner}`}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <img src="/logo.png" alt="شعار المكتبة الحيدرية" width={45} height={45} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <span className={styles.logoFallback} style={{ display: 'none' }}>📚</span>
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>المكتبة الحيدرية</span>
              <span className={styles.logoSubtitle}>AL-HAIDARIYA</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.desktopNav}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={() => setIsSearchOpen(!isSearchOpen)} aria-label="بحث" id="search-toggle">
              <FiSearch />
            </button>
            <ThemeToggle />
            <button className={styles.actionBtn} onClick={() => setCartOpen(true)} aria-label="سلة المشتريات" id="cart-toggle">
              <FiShoppingCart />
              {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
            </button>
            <button className={`${styles.actionBtn} ${styles.mobileOnly}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="القائمة" id="mobile-menu-toggle">
              {isMobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Search Bar with Autocomplete */}
        <div className={`${styles.searchBar} ${isSearchOpen ? styles.searchOpen : ''}`}>
          <div className="container">
            <div ref={searchRef} style={{ position: 'relative' }}>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="ابحث عن كتاب بالاسم أو المؤلف أو التصنيف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className={styles.searchInput}
                  id="search-input"
                  autoFocus={isSearchOpen}
                  autoComplete="off"
                />
                <button type="submit" className="btn btn-primary btn-sm" id="search-submit">بحث</button>
              </form>

              {/* Autocomplete Dropdown */}
              {showSuggestions && (
                <div className={styles.autocomplete}>
                  {suggestions.map(book => (
                    <button key={book.id} className={styles.autocompleteItem} onClick={() => handleSelectSuggestion(book)} type="button">
                      <div className={styles.autocompleteImg}>
                        {book.cover_url ? (
                          <img src={book.cover_url} alt="" onError={e => e.target.style.display = 'none'} />
                        ) : <span>📖</span>}
                      </div>
                      <div className={styles.autocompleteInfo}>
                        <span className={styles.autocompleteTitle}>{book.title}</span>
                        <span className={styles.autocompleteAuthor}>{book.author} • {book.category}</span>
                      </div>
                      <span className={styles.autocompletePrice}>{book.price?.toLocaleString('ar-IQ')} د.ع</span>
                    </button>
                  ))}
                  <button className={styles.autocompleteAll} onClick={handleSearch} type="button">
                    <FiSearch /> عرض كل نتائج "{searchQuery}"
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <nav className={styles.mobileNav}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={`${styles.mobileNavLink} ${pathname === link.href ? styles.active : ''}`}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Spacer */}
      <div style={{ height: 'var(--header-height)' }} />

      {isMobileMenuOpen && (
        <div className={styles.overlay} onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  );
}
