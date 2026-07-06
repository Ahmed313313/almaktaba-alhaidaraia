'use client';

import Link from 'next/link';
import { FaInstagram, FaFacebook, FaTiktok, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import VisitorCounter from './VisitorCounter';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* Decorative Top Border */}
      <div className={styles.topBorder} />

      <div className={`container ${styles.footerContent}`}>
        {/* Brand Column */}
        <div className={styles.column}>
          <div className={styles.brand}>
            <div className={styles.brandLogo}>
              <img src="/logo.png" alt="المكتبة الحيدرية" width={50} height={50} onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <h3 className={styles.brandName}>المكتبة الحيدرية</h3>
            <p className={styles.brandDesc}>
              وجهتكم الأولى لاقتناء أفضل الكتب الدينية والفكرية والأدبية. نوفر لكم تشكيلة واسعة من العناوين مع خدمة توصيل لجميع المحافظات العراقية.
            </p>
          </div>
          <div className={styles.social}>
            <a href="https://www.instagram.com/almaktaba_alhaidaraia" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="إنستغرام" id="footer-instagram">
              <FaInstagram />
            </a>
            <a href="https://www.facebook.com/almaktaba_alhaidaraia" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="فيسبوك" id="footer-facebook">
              <FaFacebook />
            </a>
            <a href="https://www.tiktok.com/@almaktaba_alhaidaraia1" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="تيك توك" id="footer-tiktok">
              <FaTiktok />
            </a>
            <a href="https://wa.me/9647725754850" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="واتساب" id="footer-whatsapp">
              <FaWhatsapp />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>روابط سريعة</h4>
          <nav className={styles.linkList}>
            <Link href="/" id="footer-home">الرئيسية</Link>
            <Link href="/store" id="footer-store">المتجر</Link>
            <Link href="/track" id="footer-track">تتبع طلبك</Link>
            <Link href="/about" id="footer-about">من نحن</Link>
            <Link href="/contact" id="footer-contact">تواصل معنا</Link>
          </nav>
        </div>

        {/* Categories */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>التصنيفات</h4>
          <nav className={styles.linkList}>
            <Link href="/store?category=كتب دينية وإسلامية">كتب دينية وإسلامية</Link>
            <Link href="/store?category=روايات عالمية مترجمة">روايات عالمية مترجمة</Link>
            <Link href="/store?category=فكر وفلسفة">فكر وفلسفة</Link>
            <Link href="/store?category=تطوير الذات">تطوير الذات</Link>
            <Link href="/store?category=أدب وشعر">أدب وشعر</Link>
          </nav>
        </div>

        {/* Contact Info */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>تواصل معنا</h4>
          <div className={styles.contactList}>
            <div className={styles.contactItem}>
              <FaMapMarkerAlt className={styles.contactIcon} />
              <span>العراق - البصرة</span>
            </div>
            <div className={styles.contactItem}>
              <FaPhone className={styles.contactIcon} />
              <span dir="ltr">+964 7725754850</span>
            </div>
            <div className={styles.contactItem}>
              <FaEnvelope className={styles.contactIcon} />
              <span>aa1270697@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className="container">
          <div className={styles.bottomContent}>
            <p>© {currentYear} المكتبة الحيدرية. جميع الحقوق محفوظة.</p>
            <VisitorCounter variant="footer" />
            <p className={styles.bottomSecondary}>المكتبة الحيدرية</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
