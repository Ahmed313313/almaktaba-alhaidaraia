'use client';

import { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved === 'dark' || (!saved && prefersDark);
    
    if (shouldBeDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    
    if (newDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!mounted) return null;

  return (
    <button
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={isDark ? 'الوضع الفاتح' : 'الوضع المظلم'}
      title={isDark ? 'الوضع الفاتح' : 'الوضع المظلم'}
      id="theme-toggle"
    >
      <div className={`${styles.iconWrapper} ${isDark ? styles.dark : ''}`}>
        <FiSun className={styles.sunIcon} />
        <FiMoon className={styles.moonIcon} />
      </div>
    </button>
  );
}
