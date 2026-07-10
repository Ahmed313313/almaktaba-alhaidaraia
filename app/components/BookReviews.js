'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiStar, FiSend, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from './BookReviews.module.css';

// خارج المكوّن — دالة نقية لا تعتمد على حالة التصيير
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `منذ ${days} يوم`;
  return new Date(dateStr).toLocaleDateString('ar-IQ');
}

function StarDisplay({ rating, size = 16 }) {
  return (
    <div className={styles.starsDisplay}>
      {[1, 2, 3, 4, 5].map(star => (
        <FiStar
          key={star}
          size={size}
          className={star <= rating ? styles.starFilled : styles.starEmpty}
          fill={star <= rating ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

function StarInput({ rating, setRating }) {
  const [hover, setHover] = useState(0);

  return (
    <div className={styles.starsInput}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={styles.starBtn}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => setRating(star)}
          aria-label={`${star} نجوم`}
        >
          <FiStar
            size={28}
            className={(hover || rating) >= star ? styles.starFilled : styles.starEmpty}
            fill={(hover || rating) >= star ? 'currentColor' : 'none'}
          />
        </button>
      ))}
      {rating > 0 && (
        <span className={styles.ratingText}>
          {rating === 5 ? 'ممتاز!' : rating === 4 ? 'جيد جداً' : rating === 3 ? 'جيد' : rating === 2 ? 'مقبول' : 'ضعيف'}
        </span>
      )}
    </div>
  );
}

export default function BookReviews({ bookId }) {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(() => {
    fetch(`/api/reviews?bookId=${bookId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReviews(data.reviews);
          setAverage(data.average);
          setCount(data.count);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [bookId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || rating === 0) {
      toast.error('يرجى إدخال اسمك واختيار تقييم');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, name, rating, comment }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('شكراً لتقييمك! ⭐');
        setName('');
        setRating(0);
        setComment('');
        setShowForm(false);
        fetchReviews();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('حدث خطأ');
    }
    setSubmitting(false);
  };


  return (
    <div className={styles.reviewsSection}>
      <div className={styles.reviewsHeader}>
        <div>
          <h3>⭐ التقييمات والمراجعات</h3>
          {count > 0 && (
            <div className={styles.overallRating}>
              <span className={styles.avgNumber}>{average}</span>
              <StarDisplay rating={Math.round(average)} size={18} />
              <span className={styles.countText}>({count} تقييم)</span>
            </div>
          )}
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setShowForm(!showForm)}
          id="write-review-btn"
        >
          {showForm ? 'إلغاء' : '✍️ أكتب تقييم'}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className={styles.reviewForm}>
          <div className={styles.formField}>
            <label>تقييمك *</label>
            <StarInput rating={rating} setRating={setRating} />
          </div>
          <div className={styles.formField}>
            <label>اسمك *</label>
            <div className={styles.inputWithIcon}>
              <FiUser />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="أدخل اسمك"
                required
                maxLength={50}
              />
            </div>
          </div>
          <div className={styles.formField}>
            <label>تعليقك (اختياري)</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="شاركنا رأيك عن الكتاب..."
              rows={3}
              maxLength={500}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            id="submit-review-btn"
          >
            <FiSend /> {submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex-center" style={{ padding: '2rem' }}>
          <div className="spinner" />
        </div>
      ) : reviews.length === 0 ? (
        <div className={styles.noReviews}>
          <span>📝</span>
          <p>لا توجد تقييمات بعد. كن أول من يقيّم هذا الكتاب!</p>
        </div>
      ) : (
        <div className={styles.reviewsList}>
          {reviews.map(review => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewTop}>
                <div className={styles.reviewUser}>
                  <div className={styles.avatar}>
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <strong>{review.name}</strong>
                    <span className={styles.reviewDate}>{timeAgo(review.createdAt)}</span>
                  </div>
                </div>
                <StarDisplay rating={review.rating} size={14} />
              </div>
              {review.comment && (
                <p className={styles.reviewComment}>{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Export for use on BookCard
export function MiniRating({ bookId }) {
  const [data, setData] = useState({ average: 0, count: 0 });

  useEffect(() => {
    fetch(`/api/reviews?bookId=${bookId}`)
      .then(r => r.json())
      .then(d => { if (d.success && d.count > 0) setData({ average: d.average, count: d.count }); })
      .catch(() => {});
  }, [bookId]);

  if (data.count === 0) return null;

  return (
    <div className={styles.miniRating}>
      <FiStar size={12} className={styles.starFilled} fill="currentColor" />
      <span>{data.average}</span>
      <span className={styles.miniCount}>({data.count})</span>
    </div>
  );
}
