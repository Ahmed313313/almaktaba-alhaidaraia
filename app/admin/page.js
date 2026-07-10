'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiEye, FiPackage, FiBook, FiLogOut, FiImage, FiArchive } from 'react-icons/fi';
import { CATEGORIES } from '../lib/supabase';
import { formatPrice } from '../lib/utils';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function AdminPage() {
  // استعادة حالة تسجيل الدخول مباشرة من sessionStorage (lazy init)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('admin-auth') === 'true';
    }
    return false;
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orderFilter, setOrderFilter] = useState('active');
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');

  // Data states
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [visitors, setVisitors] = useState({ total: 0, today: 0 });
  const [loading, setLoading] = useState(true);

  // Book form
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '', author: '', publisher: '', category: '', price: '', stock: '',
    description: '', cover_url: '', images: [''], label: ''
  });



  useEffect(() => {
    if (isLoggedIn) fetchAll();
  }, [isLoggedIn]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [booksRes, ordersRes, visitorsRes, reviewsRes, wishlistRes] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/orders'),
        fetch('/api/visitors'),
        fetch('/api/reviews'),
        fetch('/api/wishlist'),
      ]);
      const booksData = await booksRes.json();
      const ordersData = await ordersRes.json();
      const visitorsData = await visitorsRes.json();
      const reviewsData = await reviewsRes.json();
      const wishlistData = await wishlistRes.json();

      if (booksData.success) setBooks(booksData.books);
      if (ordersData.success) setOrders(ordersData.orders);
      if (visitorsData.success) setVisitors({ total: visitorsData.total, today: visitorsData.today });
      if (reviewsData.success) setReviews(reviewsData.reviews);
      if (wishlistData.success) setWishlist(wishlistData.wishlist || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'haider3135050313ahmedusama') {
      sessionStorage.setItem('admin-auth', 'true');
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin-auth');
    setIsLoggedIn(false);
  };

  // ===== Book CRUD =====
  const resetBookForm = () => {
    setBookForm({ title: '', author: '', publisher: '', category: '', price: '', stock: '', description: '', cover_url: '', images: [''], label: '' });
    setEditingBook(null);
    setShowBookForm(false);
  };

  const handleEditBook = (book) => {
    const bookImages = book.images && book.images.length > 0 ? [...book.images] : [''];
    setBookForm({
      title: book.title, author: book.author, publisher: book.publisher || '',
      category: book.category, price: book.price.toString(), stock: book.stock.toString(),
      description: book.description || '', cover_url: book.cover_url || '',
      images: bookImages, label: book.label || ''
    });
    setEditingBook(book);
    setShowBookForm(true);
  };

  const handleAddImageField = () => {
    setBookForm(p => ({ ...p, images: [...p.images, ''] }));
  };

  const handleRemoveImageField = (index) => {
    setBookForm(p => ({
      ...p,
      images: p.images.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (index, value) => {
    setBookForm(p => {
      const newImages = [...p.images];
      newImages[index] = value;
      return { ...p, images: newImages };
    });
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.author || !bookForm.category || !bookForm.price) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }

    const cleanImages = bookForm.images.filter(img => img && img.trim() !== '');

    try {
      if (editingBook) {
        // تعديل
        const res = await fetch('/api/books', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingBook.id, ...bookForm, images: cleanImages }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success('تم تحديث الكتاب بنجاح ✅');
          fetchAll();
          resetBookForm();
        } else {
          toast.error(data.error);
        }
      } else {
        // إضافة
        const res = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...bookForm, images: cleanImages }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success('تم إضافة الكتاب بنجاح ✅');
          fetchAll();
          resetBookForm();
        } else {
          toast.error(data.error);
        }
      }
    } catch {
      toast.error('حدث خطأ');
    }
  };

  const handleDeleteBook = async (book) => {
    if (!confirm(`هل أنت متأكد من حذف "${book.title}"؟`)) return;
    try {
      const res = await fetch(`/api/books?id=${book.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('تم حذف الكتاب ✅');
        setSelectedBooks(prev => prev.filter(id => id !== book.id));
        fetchAll();
      } else {
        toast.error(data.error || 'فشل الحذف');
      }
    } catch {
      toast.error('حدث خطأ في الاتصال');
    }
  };

  // ===== Drag & Drop Image =====
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setBookForm(p => ({ ...p, cover_url: ev.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setBookForm(p => ({ ...p, cover_url: ev.target.result }));
      reader.readAsDataURL(file);
    }
  };

  // ===== Bulk Delete Books =====
  const handleBulkDelete = async () => {
    if (selectedBooks.length === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedBooks.length} كتاب؟ هذا الإجراء لا يمكن التراجع عنه!`)) return;
    try {
      const res = await fetch(`/api/books?ids=${selectedBooks.join(',')}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) toast.success(`تم حذف ${selectedBooks.length} كتاب ✅`);
      else toast.error(data.error || 'فشل الحذف');
    } catch { toast.error('حدث خطأ في الاتصال'); }
    setSelectedBooks([]);
    fetchAll();
  };

  // ===== Bulk Category Change =====
  const handleBulkCategoryChange = async () => {
    if (selectedBooks.length === 0 || !bulkCategory) return;
    try {
      const res = await fetch('/api/books', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedBooks, category: bulkCategory }),
      });
      const data = await res.json();
      if (data.success) { toast.success(`تم تحديث التصنيف لـ ${selectedBooks.length} كتاب ✅`); setSelectedBooks([]); setBulkCategory(''); fetchAll(); }
      else toast.error(data.error);
    } catch { toast.error('حدث خطأ'); }
  };

  const toggleSelectBook = (id) => {
    setSelectedBooks(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredBooks = categoryFilter
    ? books.filter(b => b.category === categoryFilter)
    : books;

  const toggleSelectAll = () => {
    if (selectedBooks.length === filteredBooks.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(filteredBooks.map(b => b.id));
    }
  };

  // ===== Order Status Update =====
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('تم تحديث حالة الطلب ✅');
        fetchAll();
      }
    } catch {
      toast.error('حدث خطأ');
    }
  };

  // ===== Order Delete =====
  const handleDeleteOrder = async (order) => {
    if (!confirm(`هل أنت متأكد من حذف الطلب #${order.orderNumber || order.id.slice(-6)}؟`)) return;
    try {
      const res = await fetch(`/api/orders?id=${order.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('تم حذف الطلب ✅');
        fetchAll();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('حدث خطأ');
    }
  };

  // ===== LOGIN PAGE =====
  if (!isLoggedIn) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <div className={styles.loginLogo}>🔐</div>
          <h1>لوحة التحكم</h1>
          <p>المكتبة الحيدرية - لوحة إدارة المحتوى</p>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className="form-group">
              <label htmlFor="admin-password">كلمة المرور</label>
              <input
                type="password"
                id="admin-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="أدخل كلمة المرور"
                autoFocus
              />
              {error && <span className="form-error">{error}</span>}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} id="admin-login-btn">
              تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ===== STATS =====
  const newOrders = orders.filter(o => o.status === 'جديد').length;
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const lowStockBooks = books.filter(b => b.stock <= 3);

  const stats = [
    { label: 'إجمالي الكتب', value: books.length, icon: '📚', color: '#3498db' },
    { label: 'طلبات جديدة', value: newOrders, icon: '📦', color: '#e74c3c' },
    { label: 'إجمالي الزوار', value: visitors.total, icon: '👁️', color: '#9b59b6' },
    { label: 'زوار اليوم', value: visitors.today, icon: '📊', color: '#27ae60' },
  ];

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <div>
          <h1>لوحة التحكم</h1>
          <p>مرحباً بك في لوحة إدارة المكتبة الحيدرية</p>
        </div>
        <button onClick={handleLogout} className="btn btn-outline btn-sm" id="admin-logout">
          <FiLogOut /> تسجيل الخروج
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {[
          { id: 'dashboard', label: 'لوحة القيادة', icon: <FiEye /> },
          { id: 'books', label: 'إدارة الكتب', icon: <FiBook /> },
          { id: 'orders', label: 'الطلبات', icon: <FiPackage /> },
          { id: 'history', label: 'السجل', icon: <FiArchive /> },
          { id: 'reviews', label: 'التقييمات', icon: '⭐' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
            {tab.id === 'orders' && newOrders > 0 && (
              <span className={styles.tabBadge}>{newOrders}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex-center" style={{ padding: '4rem' }}>
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* ===== DASHBOARD TAB ===== */}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className={styles.statsGrid}>
                {stats.map((stat, i) => (
                  <div key={i} className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: `${stat.color}15`, color: stat.color }}>
                      {stat.icon}
                    </div>
                    <div>
                      <div className={styles.statValue}>{typeof stat.value === 'number' ? stat.value.toLocaleString('ar-IQ') : stat.value}</div>
                      <div className={styles.statLabel}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Low Stock Alert */}
              {lowStockBooks.length > 0 && (
                <div className={styles.dashboardCard} style={{ marginBottom: 'var(--spacing-xl)' }}>
                  <h3>⚠️ تنبيهات المخزون</h3>
                  <div className={styles.alertList}>
                    {lowStockBooks.map(book => (
                      <div key={book.id} className={styles.alertItem}>
                        <span className={styles.alertBookTitle}>{book.title}</span>
                        <span className={`badge ${book.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                          {book.stock === 0 ? 'نفدت الكمية' : `${book.stock} نسخ`}
                        </span>
                        <button className="btn btn-sm btn-outline" onClick={() => { handleEditBook(book); setActiveTab('books'); }}>
                          تحديث المخزون
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Orders */}
              {orders.length > 0 && (
                <div className={styles.dashboardCard}>
                  <h3>📦 آخر الطلبات</h3>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>الزبون</th>
                          <th>الهاتف</th>
                          <th>المحافظة</th>
                          <th>الكتب</th>
                          <th>التوصيل</th>
                          <th>المبلغ</th>
                          <th>الحالة</th>
                          <th>التاريخ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 10).map(order => (
                          <tr key={order.id}>
                            <td><strong>#{order.orderNumber || order.id.slice(-6)}</strong></td>
                            <td>{order.customerName}</td>
                            <td dir="ltr">{order.phone}</td>
                            <td>{order.province}</td>
                            <td>{order.items?.length || 0} كتب</td>
                            <td>{formatPrice(order.deliveryPrice || 0)} د.ع</td>
                            <td className={styles.priceCell}>{formatPrice(order.total)} د.ع</td>
                            <td>
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className={styles.statusSelect}
                              >
                                <option value="جديد">🔴 جديد</option>
                                <option value="قيد المعالجة">🟡 قيد المعالجة</option>
                                <option value="تم الشحن">🔵 تم الشحن</option>
                                <option value="تم التسليم">🟢 تم التسليم</option>
                                <option value="ملغي">⚫ ملغي</option>
                              </select>
                            </td>
                            <td>{new Date(order.createdAt).toLocaleDateString('ar-IQ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ===== BOOKS TAB ===== */}
          {activeTab === 'books' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className={styles.cardHeader}>
                <h2>📚 إدارة الكتب ({filteredBooks.length}{categoryFilter ? ` من ${books.length}` : ''})</h2>
                <button className="btn btn-primary" onClick={() => { resetBookForm(); setShowBookForm(true); }} id="add-new-book">
                  <FiPlus /> إضافة كتاب جديد
                </button>
              </div>

              {/* Category Filter */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <button
                  className={`btn btn-sm ${categoryFilter === '' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setCategoryFilter('')}
                >الكل ({books.length})</button>
                {CATEGORIES.map(cat => {
                  const count = books.filter(b => b.category === cat.name).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={cat.slug}
                      className={`btn btn-sm ${categoryFilter === cat.name ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setCategoryFilter(cat.name)}
                    >{cat.icon} {cat.name} ({count})</button>
                  );
                })}
              </div>

              {/* Bulk Actions Bar */}
              {selectedBooks.length > 0 && (
                <div className={styles.bulkBar}>
                  <span>✅ تم تحديد <strong>{selectedBooks.length}</strong> كتاب</span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <select
                      value={bulkCategory}
                      onChange={e => setBulkCategory(e.target.value)}
                      style={{ padding: '0.4rem 0.75rem', borderRadius: 6, fontSize: '0.85rem' }}
                    >
                      <option value=''>تغيير التصنيف...</option>
                      {CATEGORIES.map(cat => <option key={cat.slug} value={cat.name}>{cat.icon} {cat.name}</option>)}
                    </select>
                    {bulkCategory && (
                      <button className="btn btn-sm btn-outline" onClick={handleBulkCategoryChange}>
                        ✏️ تطبيق التصنيف
                      </button>
                    )}
                    <button className="btn btn-sm btn-outline" onClick={() => setSelectedBooks([])}>
                      إلغاء التحديد
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={handleBulkDelete}>
                      <FiTrash2 /> حذف المحدد ({selectedBooks.length})
                    </button>
                  </div>
                </div>
              )}

              {/* Book Form Modal */}
              {showBookForm && (
                <div className={styles.modal}>
                  <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                      <h3>{editingBook ? '✏️ تعديل كتاب' : '➕ إضافة كتاب جديد'}</h3>
                      <button onClick={resetBookForm} className={styles.closeBtn}><FiX /></button>
                    </div>
                    <form onSubmit={handleSaveBook} className={styles.bookForm}>
                      <div className={styles.formRow}>
                        <div className="form-group">
                          <label>عنوان الكتاب *</label>
                          <input type="text" value={bookForm.title} onChange={e => setBookForm(p => ({ ...p, title: e.target.value }))} placeholder="عنوان الكتاب" required />
                        </div>
                        <div className="form-group">
                          <label>المؤلف *</label>
                          <input type="text" value={bookForm.author} onChange={e => setBookForm(p => ({ ...p, author: e.target.value }))} placeholder="اسم المؤلف" required />
                        </div>
                      </div>
                      <div className={styles.formRow}>
                        <div className="form-group">
                          <label>دار النشر</label>
                          <input type="text" value={bookForm.publisher} onChange={e => setBookForm(p => ({ ...p, publisher: e.target.value }))} placeholder="دار النشر" />
                        </div>
                        <div className="form-group">
                          <label>التصنيف *</label>
                          <select value={bookForm.category} onChange={e => setBookForm(p => ({ ...p, category: e.target.value }))} required>
                            <option value="">اختر التصنيف</option>
                            {CATEGORIES.map(cat => <option key={cat.slug} value={cat.name}>{cat.icon} {cat.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className={styles.formRow}>
                        <div className="form-group">
                          <label>السعر (د.ع) *</label>
                          <input type="number" value={bookForm.price} onChange={e => setBookForm(p => ({ ...p, price: e.target.value }))} placeholder="25000" required min="0" />
                        </div>
                        <div className="form-group">
                          <label>المخزون (عدد النسخ)</label>
                          <input type="number" value={bookForm.stock} onChange={e => setBookForm(p => ({ ...p, stock: e.target.value }))} placeholder="10" min="0" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>🏷️ ملصق الكتاب (اختياري)</label>
                        <select value={bookForm.label} onChange={e => setBookForm(p => ({ ...p, label: e.target.value }))}>
                          <option value="">— بدون ملصق —</option>
                          <option value="جديد">🆕 جديد</option>
                          <option value="الأكثر طلباً">🔥 الأكثر طلباً</option>
                          <option value="موصى به">⭐ موصى به</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>وصف الكتاب</label>
                        <textarea value={bookForm.description} onChange={e => setBookForm(p => ({ ...p, description: e.target.value }))} placeholder="وصف مختصر عن الكتاب..." rows={3} />
                      </div>

                      {/* صورة الغلاف - Drag & Drop */}
                      <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FiImage /> صورة الغلاف
                        </label>
                        <div
                          onDrop={handleDrop}
                          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          style={{
                            border: `2px dashed ${dragOver ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                            borderRadius: 10, padding: 16, textAlign: 'center', marginBottom: 8,
                            background: dragOver ? 'rgba(212,168,83,0.08)' : 'var(--color-bg-warm)',
                            transition: 'all 0.2s', cursor: 'pointer',
                          }}
                          onClick={() => document.getElementById('cover-file-input').click()}
                        >
                          {bookForm.cover_url ? (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <img src={bookForm.cover_url} alt="غلاف" style={{ maxHeight: 120, borderRadius: 6, maxWidth: '100%' }} />
                              <button type="button" onClick={e => { e.stopPropagation(); setBookForm(p => ({ ...p, cover_url: '' })); }}
                                style={{ position: 'absolute', top: -8, left: -8, background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 12 }}>✕</button>
                            </div>
                          ) : (
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                              <div style={{ fontSize: '2rem', marginBottom: 4 }}>🖼️</div>
                              <div>اسحب صورة هنا أو اضغط للاختيار</div>
                            </div>
                          )}
                        </div>
                        <input id="cover-file-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileInput} />
                        <input
                          type="text"
                          value={bookForm.cover_url.startsWith('data:') ? '' : bookForm.cover_url}
                          onChange={e => setBookForm(p => ({ ...p, cover_url: e.target.value }))}
                          placeholder="أو أدخل رابط URL للصورة (https://...)"
                          style={{ width: '100%', marginTop: 8 }}
                        />
                      </div>

                      {/* صور إضافية */}
                      <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FiImage /> صور إضافية (روابط URL)
                        </label>
                        {bookForm.images.map((img, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <input
                              type="url"
                              value={img}
                              onChange={e => handleImageChange(idx, e.target.value)}
                              placeholder={`رابط الصورة ${idx + 1} (https://...)`}
                              style={{ flex: 1 }}
                            />
                            {bookForm.images.length > 1 && (
                              <button type="button" onClick={() => handleRemoveImageField(idx)}
                                className={styles.deleteBtn} title="حذف" style={{ width: 36, height: 36, flexShrink: 0 }}>
                                <FiX />
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={handleAddImageField} className="btn btn-sm btn-outline" style={{ marginTop: 4 }}>
                          <FiPlus /> إضافة صورة أخرى
                        </button>
                      </div>

                      <div className={styles.formActions}>
                        <button type="submit" className="btn btn-primary">
                          {editingBook ? '💾 حفظ التعديلات' : '➕ إضافة الكتاب'}
                        </button>
                        <button type="button" className="btn btn-outline" onClick={resetBookForm}>إلغاء</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Books List */}
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>
                        <input type="checkbox"
                          checked={filteredBooks.length > 0 && filteredBooks.every(b => selectedBooks.includes(b.id))}
                          onChange={toggleSelectAll}
                          title="تحديد الكل"
                          style={{ cursor: 'pointer', width: 16, height: 16 }}
                        />
                      </th>
                      <th>العنوان</th>
                      <th>المؤلف</th>
                      <th>التصنيف</th>
                      <th>السعر</th>
                      <th>المخزون</th>
                      <th>الصور</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                        لا توجد كتب في هذا التصنيف
                      </td></tr>
                    ) : filteredBooks.map(book => (
                      <tr key={book.id} className={selectedBooks.includes(book.id) ? styles.selectedRow : ''}>
                        <td>
                          <input type="checkbox"
                            checked={selectedBooks.includes(book.id)}
                            onChange={() => toggleSelectBook(book.id)}
                            style={{ cursor: 'pointer', width: 16, height: 16 }}
                          />
                        </td>
                        <td><strong>{book.title}</strong></td>
                        <td>{book.author}</td>
                        <td><span className="badge badge-gold">{book.category}</span></td>
                        <td className={styles.priceCell}>{formatPrice(book.price)} د.ع</td>
                        <td>
                          <span className={`badge ${book.stock === 0 ? 'badge-danger' : book.stock <= 3 ? 'badge-warning' : 'badge-success'}`}>
                            {book.stock}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-gold">
                            {((book.images?.length || 0) + (book.cover_url ? 1 : 0)) || 0} 📷
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button onClick={() => handleEditBook(book)} className={styles.editBtn} title="تعديل"><FiEdit2 /></button>
                            <button onClick={() => handleDeleteBook(book)} className={styles.deleteBtn} title="حذف"><FiTrash2 /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ===== ORDERS TAB ===== */}
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className={styles.cardHeader}>
                <h2>📦 الطلبات النشطة ({orders.filter(o => !['تم التسليم', 'ملغي'].includes(o.status)).length})</h2>
              </div>

              {(() => {
                const activeOrders = orders.filter(o => !['تم التسليم', 'ملغي'].includes(o.status));
                return activeOrders.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <h3>لا توجد طلبات نشطة</h3>
                    <p>ستظهر الطلبات هنا عندما يطلب الزبائن من الموقع</p>
                  </div>
                ) : (
                  <div className={styles.ordersList}>
                    {activeOrders.map(order => (
                      <div key={order.id} className={styles.orderCard}>
                        <div className={styles.orderHeader}>
                          <div>
                            <span className={styles.orderId}>طلب #{order.orderNumber || order.id.slice(-6)}</span>
                            <span className={styles.orderDate}>{new Date(order.createdAt).toLocaleString('ar-IQ')}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className={styles.statusSelect}
                            >
                              <option value="جديد">🔴 جديد</option>
                              <option value="قيد المعالجة">🟡 قيد المعالجة</option>
                              <option value="تم الشحن">🔵 تم الشحن</option>
                              <option value="تم التسليم">🟢 تم التسليم</option>
                              <option value="ملغي">⚫ ملغي</option>
                            </select>
                            <button onClick={() => handleDeleteOrder(order)} className={styles.deleteBtn} title="حذف الطلب">
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                        <div className={styles.orderBody}>
                          <div className={styles.orderCustomer}>
                            <p><strong>👤 الزبون:</strong> {order.customerName}</p>
                            <p><strong>📱 الهاتف:</strong> <span dir="ltr">{order.phone}</span></p>
                            <p><strong>📍 المحافظة:</strong> {order.province}</p>
                            <p><strong>🏠 العنوان:</strong> {order.address}</p>
                            {order.notes && <p><strong>📝 ملاحظات:</strong> {order.notes}</p>}
                          </div>
                          <div className={styles.orderItems}>
                            <h4>الكتب المطلوبة:</h4>
                            {order.items?.map((item, i) => (
                              <div key={i} className={styles.orderItem}>
                                <span>📖 {item.title}</span>
                                <span>×{item.quantity}</span>
                                <span className={styles.priceCell}>{formatPrice(item.price * item.quantity)} د.ع</span>
                              </div>
                            ))}
                            <div className={styles.orderItem} style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                              <span>🚚 أجرة التوصيل ({order.province})</span>
                              <span></span>
                              <span className={styles.priceCell}>{formatPrice(order.deliveryPrice || 0)} د.ع</span>
                            </div>
                            <div className={styles.orderTotal}>
                              <strong>المجموع الكلي: {formatPrice(order.total)} د.ع</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* ===== HISTORY TAB ===== */}
          {activeTab === 'history' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className={styles.cardHeader}>
                <h2>📋 سجل الطلبات ({orders.filter(o => ['تم التسليم', 'ملغي'].includes(o.status)).length})</h2>
              </div>

              {(() => {
                const historyOrders = orders.filter(o => ['تم التسليم', 'ملغي'].includes(o.status));
                return historyOrders.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3>لا يوجد سجل بعد</h3>
                    <p>الطلبات المكتملة والملغية ستظهر هنا</p>
                  </div>
                ) : (
                  <div className={styles.ordersList}>
                    {historyOrders.map(order => (
                      <div key={order.id} className={styles.orderCard} style={{ opacity: order.status === 'ملغي' ? 0.6 : 1 }}>
                        <div className={styles.orderHeader}>
                          <div>
                            <span className={styles.orderId}>طلب #{order.orderNumber || order.id.slice(-6)}</span>
                            <span className={styles.orderDate}>{new Date(order.createdAt).toLocaleString('ar-IQ')}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span className={`badge ${order.status === 'تم التسليم' ? 'badge-success' : 'badge-danger'}`}>
                              {order.status === 'تم التسليم' ? '🟢 تم التسليم' : '⚫ ملغي'}
                            </span>
                            <button onClick={() => handleDeleteOrder(order)} className={styles.deleteBtn} title="حذف من السجل">
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                        <div className={styles.orderBody}>
                          <div className={styles.orderCustomer}>
                            <p><strong>👤 الزبون:</strong> {order.customerName}</p>
                            <p><strong>📱 الهاتف:</strong> <span dir="ltr">{order.phone}</span></p>
                            <p><strong>📍 المحافظة:</strong> {order.province}</p>
                          </div>
                          <div className={styles.orderItems}>
                            {order.items?.map((item, i) => (
                              <div key={i} className={styles.orderItem}>
                                <span>📖 {item.title}</span>
                                <span>×{item.quantity}</span>
                                <span className={styles.priceCell}>{formatPrice(item.price * item.quantity)} د.ع</span>
                              </div>
                            ))}
                            <div className={styles.orderTotal}>
                              <strong>المجموع: {formatPrice(order.total)} د.ع</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </motion.div>
          )}
          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className={styles.cardHeader}>
                <h2>⭐ إدارة التقييمات ({reviews.length})</h2>
              </div>

              {/* Wishlist */}
              {wishlist.length > 0 && (
                <div style={{ marginBottom: 24, padding: 16, background: 'var(--color-bg-warm)', borderRadius: 12, border: '1px solid var(--color-border-light)' }}>
                  <h3 style={{ marginBottom: 12 }}>🔔 قائمة الرغبات ({wishlist.reduce((s, w) => s + w.count, 0)} طلب)</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {wishlist.map(w => (
                      <div key={w.bookId} style={{ background: 'var(--color-bg-card)', padding: '6px 14px', borderRadius: 20, fontSize: '0.85rem', border: '1px solid var(--color-border)' }}>
                        📖 {w.bookTitle} <strong style={{ color: 'var(--color-secondary-dark)' }}>×{w.count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">⭐</div>
                  <h3>لا توجد تقييمات بعد</h3>
                  <p>ستظهر تقييمات الزبائن هنا</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {reviews.map(review => (
                    <div key={review.id} style={{ background: 'var(--color-bg-card)', padding: 16, borderRadius: 12, border: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-secondary), var(--color-secondary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                            {review.name?.charAt(0)}
                          </div>
                          <div>
                            <strong style={{ display: 'block' }}>{review.name}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              {'⭐'.repeat(review.rating)} • {new Date(review.createdAt || review.created_at).toLocaleDateString('ar-IQ')}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginRight: 'auto' }}>
                            كتاب: {books.find(b => b.id === (review.bookId || review.book_id))?.title || 'غير معروف'}
                          </span>
                        </div>
                        {review.comment && <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', paddingRight: 46 }}>{review.comment}</p>}
                      </div>
                      <button
                        onClick={async () => {
                          if (!confirm('هل تريد حذف هذا التقييم؟')) return;
                          const res = await fetch(`/api/reviews?id=${review.id}`, { method: 'DELETE' });
                          const d = await res.json();
                          if (d.success) { toast.success('تم حذف التقييم'); fetchAll(); }
                          else toast.error(d.error);
                        }}
                        className={styles.deleteBtn}
                        title="حذف التقييم"
                        style={{ flexShrink: 0 }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
