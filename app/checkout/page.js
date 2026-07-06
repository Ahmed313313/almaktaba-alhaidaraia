'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCheck, FiShoppingBag, FiSend, FiTruck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../components/CartProvider';
import { formatPrice, PROVINCES } from '../lib/utils';
import toast from 'react-hot-toast';
import styles from './page.module.css';

// أسعار التوصيل
function getDeliveryPrice(province) {
  if (!province) return 0;
  return province === 'البصرة' ? 3000 : 5000;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    province: '',
    address: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const deliveryPrice = useMemo(() => getDeliveryPrice(formData.province), [formData.province]);
  const grandTotal = totalPrice + deliveryPrice;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'يرجى إدخال الاسم الكامل';
    if (!formData.phone.trim()) newErrors.phone = 'يرجى إدخال رقم الهاتف';
    else if (!/^07[0-9]{9}$/.test(formData.phone.replace(/\s/g, '')))
      newErrors.phone = 'يرجى إدخال رقم هاتف عراقي صحيح (07xxxxxxxxx)';
    if (!formData.province) newErrors.province = 'يرجى اختيار المحافظة';
    if (!formData.address.trim()) newErrors.address = 'يرجى إدخال العنوان التفصيلي';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      // إرسال الطلب للـ API (يتم حفظه في الموقع)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          phone: formData.phone,
          province: formData.province,
          address: formData.address,
          notes: formData.notes,
          items: items.map(item => ({
            id: item.id,
            title: item.title,
            author: item.author,
            price: item.price,
            quantity: item.quantity,
          })),
          total: grandTotal,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // بناء رسالة الواتساب
        const orderItems = items.map(item =>
          `📖 ${item.title} (${item.quantity} نسخة) - ${formatPrice(item.price * item.quantity)} د.ع`
        ).join('\n');

        const orderMessage = `🛒 *طلب جديد - المكتبة الحيدرية*\n` +
          `📋 رقم الطلب: #${result.order.orderNumber}\n\n` +
          `👤 الاسم: ${formData.name}\n` +
          `📱 الهاتف: ${formData.phone}\n` +
          `📍 المحافظة: ${formData.province}\n` +
          `🏠 العنوان: ${formData.address}\n` +
          `${formData.notes ? `📝 ملاحظات: ${formData.notes}\n` : ''}\n` +
          `━━━━━━━━━━━━━━━\n` +
          `${orderItems}\n` +
          `━━━━━━━━━━━━━━━\n` +
          `📦 سعر الكتب: ${formatPrice(totalPrice)} د.ع\n` +
          `🚚 التوصيل: ${formatPrice(result.order.deliveryPrice)} د.ع\n` +
          `💰 *المجموع الكلي: ${formatPrice(result.order.total)} د.ع*\n` +
          `💳 الدفع عند الاستلام`;

        // فتح واتساب تلقائياً
        const whatsappUrl = `https://wa.me/9647725754850?text=${encodeURIComponent(orderMessage)}`;
        window.open(whatsappUrl, '_blank');

        setOrderData(result.order);
        setOrderComplete(true);
        clearCart();

        toast.success('تم إرسال طلبك بنجاح! ✅', {
          style: {
            direction: 'rtl',
            fontFamily: 'var(--font-main)',
            background: 'var(--color-primary)',
            color: 'var(--color-text-on-dark)',
          },
        });
      } else {
        toast.error(result.error || 'حدث خطأ، حاول مرة أخرى');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال، حاول مرة أخرى');
    }

    setIsSubmitting(false);
  };

  if (orderComplete) {
    return (
      <div className={`container ${styles.successPage}`}>
        <motion.div
          className={styles.successCard}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.successIcon}>
            <FiCheck />
          </div>
          <h1>تم إرسال الطلب بنجاح! 🎉</h1>
          <p>
            شكراً لك <strong>{formData.name}</strong>!
            <br />
            رقم طلبك: <strong>#{orderData?.orderNumber}</strong>
            <br /><br />
            تم حفظ طلبك في النظام وإرسال التفاصيل عبر واتساب.
            <br />
            سيتواصل معك فريق المكتبة الحيدرية لتأكيد الطلب والتوصيل.
            <br /><br />
            يمكنك متابعة حالة طلبك من صفحة <Link href="/track" style={{ color: 'var(--color-secondary-dark)', fontWeight: 600 }}>تتبع الطلبات</Link>
          </p>
          <div className={styles.successActions}>
            <Link href="/store" className="btn btn-primary btn-lg" id="continue-shopping">
              متابعة التسوق
            </Link>
            <Link href="/track" className="btn btn-outline" id="track-order">
              تتبع طلبي
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>السلة فارغة</h3>
          <p>أضف كتباً إلى السلة أولاً للمتابعة</p>
          <Link href="/store" className="btn btn-primary" id="browse-to-add">تصفح الكتب</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className={styles.pageHeader}>
        <div className="container">
          <h1>إتمام الطلب</h1>
          <p>أكمل بياناتك وسيصلك الطلب لحد باب بيتك</p>
        </div>
      </section>

      <div className={`container ${styles.checkoutLayout}`}>
        {/* Form */}
        <motion.form
          className={styles.form}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.formTitle}><FiShoppingBag /> بيانات التوصيل</h2>

          <div className="form-group">
            <label htmlFor="name">الاسم الكامل *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="مثال: أحمد محمد"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">رقم الهاتف *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="07xxxxxxxxx"
              dir="ltr"
              style={{ textAlign: 'left' }}
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="province">المحافظة *</label>
            <select
              id="province"
              name="province"
              value={formData.province}
              onChange={handleChange}
            >
              <option value="">اختر المحافظة</option>
              {PROVINCES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.province && <span className="form-error">{errors.province}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">العنوان التفصيلي *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="المنطقة، الشارع، أقرب نقطة دالة"
            />
            {errors.address && <span className="form-error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="notes">ملاحظات إضافية (اختياري)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="أي ملاحظات خاصة بالطلب أو التوصيل..."
              rows={3}
            />
          </div>

          <div className={styles.paymentNote}>
            <h4>💳 طريقة الدفع</h4>
            <p>الدفع عند الاستلام - سيتم إرسال تفاصيل الطلب تلقائياً إلى المكتبة + نسخة عبر واتساب</p>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={isSubmitting}
            id="submit-order"
          >
            {isSubmitting ? (
              <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> جاري إرسال الطلب...</>
            ) : (
              <><FiSend /> تأكيد وإرسال الطلب</>
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-sm)' }}>
            سيتم فتح واتساب تلقائياً لتأكيد الطلب مع البائع
          </p>
        </motion.form>

        {/* Order Summary */}
        <motion.div
          className={styles.summary}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className={styles.summaryTitle}>ملخص الطلب</h2>
          <div className={styles.summaryItems}>
            {items.map(item => (
              <div key={item.id} className={styles.summaryItem}>
                <div className={styles.summaryItemIcon}>📖</div>
                <div className={styles.summaryItemInfo}>
                  <h4>{item.title}</h4>
                  <p>{item.author} × {item.quantity}</p>
                </div>
                <span className={styles.summaryItemPrice}>
                  {formatPrice(item.price * item.quantity)} <small>د.ع</small>
                </span>
              </div>
            ))}
          </div>

          <div className={styles.summaryDivider} />

          <div className={styles.summaryRow}>
            <span>عدد الكتب:</span>
            <strong>{items.reduce((s, i) => s + i.quantity, 0)} كتاب</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>سعر الكتب:</span>
            <strong>{formatPrice(totalPrice)} <small>د.ع</small></strong>
          </div>

          <div className={styles.summaryRow}>
            <span><FiTruck style={{ verticalAlign: 'middle', marginLeft: 4 }} /> التوصيل:</span>
            {formData.province ? (
              <strong style={{ color: 'var(--color-success)' }}>
                {formatPrice(deliveryPrice)} <small>د.ع</small>
              </strong>
            ) : (
              <strong style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>اختر المحافظة</strong>
            )}
          </div>

          {formData.province && (
            <div className={styles.deliveryNote}>
              🚚 {formData.province === 'البصرة' ? 'توصيل داخل البصرة' : `توصيل إلى ${formData.province}`}
              {' - '}
              {formatPrice(deliveryPrice)} د.ع
            </div>
          )}

          <div className={styles.summaryDivider} />
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>المجموع الكلي:</span>
            <strong>{formatPrice(grandTotal)} <small>د.ع</small></strong>
          </div>
        </motion.div>
      </div>
    </>
  );
}
