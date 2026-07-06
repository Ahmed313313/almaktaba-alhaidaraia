'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPackage, FiTruck, FiCheck, FiClock, FiX } from 'react-icons/fi';
import { formatPrice } from '../lib/utils';
import styles from './page.module.css';

const STATUS_CONFIG = {
  'جديد': { icon: <FiClock />, color: '#e74c3c', label: 'جديد - بانتظار المعالجة', bg: 'rgba(231, 76, 60, 0.1)' },
  'قيد المعالجة': { icon: <FiPackage />, color: '#f39c12', label: 'قيد المعالجة - يتم تجهيز طلبك', bg: 'rgba(243, 156, 18, 0.1)' },
  'تم الشحن': { icon: <FiTruck />, color: '#3498db', label: 'تم الشحن - طلبك في الطريق إليك', bg: 'rgba(52, 152, 219, 0.1)' },
  'تم التسليم': { icon: <FiCheck />, color: '#27ae60', label: 'مكتمل - تم تسليم الطلب بنجاح', bg: 'rgba(39, 174, 96, 0.1)' },
  'ملغي': { icon: <FiX />, color: '#95a5a6', label: 'ملغي', bg: 'rgba(149, 165, 166, 0.1)' },
};

const STATUS_STEPS = ['جديد', 'قيد المعالجة', 'تم الشحن', 'تم التسليم'];

export default function TrackPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\s/g, '');

    if (!cleanPhone) {
      setError('يرجى إدخال رقم الهاتف');
      return;
    }
    if (!/^07[0-9]{9}$/.test(cleanPhone)) {
      setError('يرجى إدخال رقم هاتف عراقي صحيح (07xxxxxxxxx)');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/orders?phone=${cleanPhone}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    }

    setSearched(true);
    setLoading(false);
  };

  const getStepIndex = (status) => {
    if (status === 'ملغي') return -1;
    return STATUS_STEPS.indexOf(status);
  };

  return (
    <>
      <section className={styles.pageHeader}>
        <div className="container">
          <h1>تتبع طلبك</h1>
          <p>أدخل رقم هاتفك لمعرفة حالة طلباتك</p>
        </div>
      </section>

      <div className={`container ${styles.trackContainer}`}>
        {/* Search Form */}
        <motion.div
          className={styles.searchCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.searchIcon}>📦</div>
          <h2>ابحث عن طلباتك</h2>
          <p>أدخل رقم الهاتف الذي استخدمته عند الطلب</p>

          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchInputGroup}>
              <FiSearch className={styles.inputIcon} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(''); }}
                placeholder="07xxxxxxxxx"
                dir="ltr"
                className={styles.searchInput}
                id="track-phone-input"
              />
              <button type="submit" className="btn btn-primary" disabled={loading} id="track-search-btn">
                {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'بحث'}
              </button>
            </div>
            {error && <span className="form-error" style={{ marginTop: 8 }}>{error}</span>}
          </form>
        </motion.div>

        {/* Results */}
        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {orders.length === 0 ? (
              <div className="empty-state" style={{ marginTop: 'var(--spacing-2xl)' }}>
                <div className="empty-state-icon">🔍</div>
                <h3>لا توجد طلبات</h3>
                <p>لم نعثر على طلبات مرتبطة بهذا الرقم</p>
                <Link href="/store" className="btn btn-primary">تصفح الكتب</Link>
              </div>
            ) : (
              <div className={styles.ordersList}>
                <h3 className={styles.resultsTitle}>
                  طلباتك ({orders.length})
                </h3>

                {orders.map((order) => {
                  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG['جديد'];
                  const stepIndex = getStepIndex(order.status);

                  return (
                    <motion.div
                      key={order.id}
                      className={styles.orderCard}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {/* Order Header */}
                      <div className={styles.orderHeader}>
                        <div>
                          <span className={styles.orderNumber}>طلب #{order.orderNumber || order.id.slice(-6)}</span>
                          <span className={styles.orderDate}>
                            {new Date(order.createdAt).toLocaleDateString('ar-IQ', {
                              year: 'numeric', month: 'long', day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div
                          className={styles.statusBadge}
                          style={{ background: statusConfig.bg, color: statusConfig.color }}
                        >
                          {statusConfig.icon}
                          <span>{order.status}</span>
                        </div>
                      </div>

                      {/* Status Progress */}
                      {order.status !== 'ملغي' && (
                        <div className={styles.progressSection}>
                          <div className={styles.progressBar}>
                            {STATUS_STEPS.map((step, idx) => (
                              <div key={step} className={styles.progressStep}>
                                <div
                                  className={`${styles.progressDot} ${idx <= stepIndex ? styles.progressActive : ''}`}
                                  style={idx <= stepIndex ? { background: statusConfig.color } : {}}
                                >
                                  {idx <= stepIndex ? '✓' : idx + 1}
                                </div>
                                <span className={`${styles.progressLabel} ${idx <= stepIndex ? styles.progressLabelActive : ''}`}>
                                  {step}
                                </span>
                                {idx < STATUS_STEPS.length - 1 && (
                                  <div
                                    className={`${styles.progressLine} ${idx < stepIndex ? styles.progressLineActive : ''}`}
                                    style={idx < stepIndex ? { background: statusConfig.color } : {}}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                          <p className={styles.statusDescription} style={{ color: statusConfig.color }}>
                            {statusConfig.label}
                          </p>
                        </div>
                      )}

                      {order.status === 'ملغي' && (
                        <div className={styles.cancelledNote}>
                          تم إلغاء هذا الطلب
                        </div>
                      )}

                      {/* Order Items */}
                      <div className={styles.orderItems}>
                        {order.items?.map((item, i) => (
                          <div key={i} className={styles.orderItem}>
                            <span className={styles.itemIcon}>📖</span>
                            <div className={styles.itemInfo}>
                              <span className={styles.itemTitle}>{item.title}</span>
                              <span className={styles.itemMeta}>{item.author} × {item.quantity}</span>
                            </div>
                            <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)} د.ع</span>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer */}
                      <div className={styles.orderFooter}>
                        <div className={styles.footerRow}>
                          <span>📍 التوصيل إلى: {order.province}</span>
                          <span>🚚 أجرة التوصيل: {formatPrice(order.deliveryPrice || 0)} د.ع</span>
                        </div>
                        <div className={styles.orderTotal}>
                          💰 المجموع الكلي: <strong>{formatPrice(order.total)} د.ع</strong>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </>
  );
}
