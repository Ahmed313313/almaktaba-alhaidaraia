import { FaInstagram, FaFacebook, FaTiktok, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import styles from './page.module.css';

export const metadata = {
  title: 'تواصل معنا',
  description: 'تواصل مع المكتبة الحيدرية عبر واتساب أو إنستغرام. العراق - البصرة. خدمة توصيل لجميع المحافظات.',
};

export default function ContactPage() {
  return (
    <>
      <section className={styles.pageHeader}>
        <div className="container">
          <h1>تواصل معنا</h1>
          <p>نسعد بتواصلكم ونرحب بجميع استفساراتكم</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.contactGrid}>
            {/* Contact Info */}
            <div className={styles.contactInfo}>
              <h2 className={styles.infoTitle}>معلومات التواصل</h2>
              <p className={styles.infoDesc}>
                يمكنكم التواصل معنا عبر أي من القنوات التالية وسنرد عليكم باذن الله تعالى .
              </p>

              <div className={styles.infoCards}>
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}><FaMapMarkerAlt /></div>
                  <div>
                    <h4>الموقع</h4>
                    <p>العراق - البصرة</p>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}><FaPhone /></div>
                  <div>
                    <h4>الهاتف</h4>
                    <p dir="ltr" style={{ textAlign: 'right' }}>+964 772 575 4850</p>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}><FaEnvelope /></div>
                  <div>
                    <h4>البريد الإلكتروني</h4>
                    <p>aa1270697@gmail.com</p>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}><FaClock /></div>
                  <div>
                    <h4>أوقات العمل</h4>
                    <p>يومياً من 9 صباحاً - 10 مساءً</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className={styles.socialSection}>
                <h3>تابعونا على</h3>
                <div className={styles.socialLinks}>
                  <a href="https://www.instagram.com/almaktaba_alhaidaraia" target="_blank" rel="noopener noreferrer" className={styles.socialCard} id="contact-instagram">
                    <FaInstagram className={styles.socialIcon} />
                    <div>
                      <strong>إنستغرام</strong>
                      <span>@almaktaba_alhaidaraia</span>
                    </div>
                  </a>
                  <a href="https://www.facebook.com/almaktaba_alhaidaraia" target="_blank" rel="noopener noreferrer" className={styles.socialCard} id="contact-facebook">
                    <FaFacebook className={styles.socialIcon} />
                    <div>
                      <strong>فيسبوك</strong>
                      <span>almaktaba_alhaidaraia</span>
                    </div>
                  </a>
                  <a href="https://www.tiktok.com/@almaktaba_alhaidaraia1" target="_blank" rel="noopener noreferrer" className={styles.socialCard} id="contact-tiktok">
                    <FaTiktok className={styles.socialIcon} />
                    <div>
                      <strong>تيك توك</strong>
                      <span>@almaktaba_alhaidaraia1</span>
                    </div>
                  </a>
                  <a href="https://wa.me/9647725754850" target="_blank" rel="noopener noreferrer" className={`${styles.socialCard} ${styles.whatsappCard}`} id="contact-whatsapp">
                    <FaWhatsapp className={styles.socialIcon} />
                    <div>
                      <strong>واتساب</strong>
                      <span>تواصل مباشر</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Map / Visual */}
            <div className={styles.mapSection}>
              <div className={styles.mapPlaceholder}>
                <FaMapMarkerAlt className={styles.mapIcon} />
                <h3>النجف الأشرف - العراق</h3>
                <p>يمكنكم زيارتنا في المكتبة أو طلب الكتب عبر الموقع مع التوصيل لجميع المحافظات</p>
                <a
                  href="https://wa.me/9647725754850?text=مرحباً، أريد الاستفسار عن موقع المكتبة"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  id="map-whatsapp"
                >
                  <FaWhatsapp /> تواصل معنا
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
