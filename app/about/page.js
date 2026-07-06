import { FiBookOpen, FiTruck, FiHeart, FiGlobe } from 'react-icons/fi';
import styles from './page.module.css';

export const metadata = {
  title: 'من نحن',
  description: 'تعرّف على المكتبة الحيدرية - مكتبة متخصصة في بيع الكتب الدينية والفكرية والأدبية في العراق مع خدمة توصيل لجميع المحافظات.',
};

export default function AboutPage() {
  return (
    <>
      <section className={styles.pageHeader}>
        <div className="container">
          <h1>من نحن</h1>
          <p>تعرّف على المكتبة الحيدرية ورسالتنا</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.aboutGrid}>
            <div className={styles.aboutContent}>
              <h2 className={styles.sectionTitle}>
                المكتبة <span className={styles.gold}>الحيدرية</span>
              </h2>
              <p className={styles.aboutText}>
                المكتبة الحيدرية هي وجهتكم الأولى لاقتناء أفضل الكتب في العراق. تأسست المكتبة بهدف نشر الثقافة والمعرفة وتوفير الكتب القيّمة  مع خدمة توصيل تغطي جميع المحافظات العراقية.
              </p>
              <p className={styles.aboutText}>
                نحرص على توفير تشكيلة متنوعة وشاملة تضم أفضل العناوين في مختلف المجالات: من الكتب الدينية والإسلامية، مروراً بالفكر والفلسفة والتاريخ، وصولاً إلى الروايات العربية والعالمية وكتب تطوير الذات والأدب والشعر.
              </p>
              <p className={styles.aboutText}>
                نؤمن بأن الكتاب هو خير جليس، ولذلك نسعى دائماً لتقديم أفضل تجربة شراء كتب أونلاين في العراق، حيث يمكنكم تصفح مكتبتنا الرقمية واختيار ما يناسبكم من العناوين وطلبها بكل سهولة ويسر.
              </p>
            </div>

            <div className={styles.aboutImage}>
              <div className={styles.imagePlaceholder}>
                <span>📚</span>
                <p>المكتبة الحيدرية</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.valuesSection}`}>
        <div className="container">
          <h2 className={styles.centerTitle}>قيمنا ورسالتنا</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FiBookOpen /></div>
              <h3>تنوّع فريد</h3>
              <p>نوفر تشكيلة واسعة من الكتب في كل الأقسام لتلبية جميع الأذواق والاهتمامات القرائية.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FiTruck /></div>
              <h3>توصيل شامل</h3>
              <p>نوصل طلباتكم إلى جميع محافظات العراق الـ18 بأمان وسرعة.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FiHeart /></div>
              <h3>اختيار مميز</h3>
              <p>نحرص على انتقاء أفضل العناوين وتقديم كتب بجودة عالية تلبي تطلعات القارئ العراقي.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FiGlobe /></div>
              <h3>نشر الثقافة</h3>
              <p>نسعى لأن نكون جسراً بين القارئ العراقي وأفضل الكتب العربية والعالمية.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <strong>500+</strong>
              <span>عنوان متوفر</span>
            </div>
            <div className={styles.statItem}>
              <strong>18</strong>
              <span>محافظة نغطيها</span>
            </div>
            <div className={styles.statItem}>
              <strong>1000+</strong>
              <span>طلب أُنجز</span>
            </div>
            <div className={styles.statItem}>
              <strong>12</strong>
              <span>تصنيف متنوع</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
