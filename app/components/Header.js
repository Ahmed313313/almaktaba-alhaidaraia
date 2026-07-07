'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiSearch, FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from './CartProvider';
import ThemeToggle from './ThemeToggle';
import styles from './Header.module.css';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems, setIsOpen: setCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/store?search=${encodeURIComponent(searchQuery.trim())}`;
    }
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
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Search Toggle */}
            <button
              className={styles.actionBtn}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="بحث"
              id="search-toggle"
            >
              <FiSearch />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart */}
            <button
              className={styles.actionBtn}
              onClick={() => setCartOpen(true)}
              aria-label="سلة المشتريات"
              id="cart-toggle"
            >
              <FiShoppingCart />
              {totalItems > 0 && (
                <span className={styles.cartBadge}>{totalItems}</span>
              )}
            </button>


            {/* Mobile Menu Toggle */}
            <button
              className={`${styles.actionBtn} ${styles.mobileOnly}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="القائمة"
              id="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className={`${styles.searchBar} ${isSearchOpen ? styles.searchOpen : ''}`}>
          <div className="container">
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="ابحث عن كتاب بالاسم أو المؤلف أو التصنيف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                id="search-input"
                autoFocus={isSearchOpen}
              />
              <button type="submit" className="btn btn-primary btn-sm" id="search-submit">
                بحث
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <nav className={styles.mobileNav}>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.mobileNavLink} ${pathname === link.href ? styles.active : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Spacer */}
      <div style={{ height: 'var(--header-height)' }} />

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.overlay} onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  );
}
