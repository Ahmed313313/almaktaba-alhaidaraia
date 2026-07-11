'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiEye, FiPackage, FiBook, FiLogOut, FiImage, FiArchive } from 'react-icons/fi';
import { CATEGORIES } from '../lib/supabase';
import { formatPrice } from '../lib/utils';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function AdminPage() {
  // mounted: يمنع عرض أي شيء حتى يُحدَّد وضع تسجيل الدخول في المتصفح
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orderFilter, setOrderFilter] = useState('active');
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [imagesDragOver, setImagesDragOver] = useState(false);
  const [dragImgIdx, setDragImgIdx] = useState(null);
  const [bulkCategory, setBulkCategory] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

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
    description: '', cover_url: '', images: [''], label: '', parts: '', volumes: ''
  });

  // تحقق من تسجيل الدخول بعد الـ mount لتجنب Hydration Error
  useEffect(() => {
    const loggedIn = sessionStorage.getItem('admin-auth') === 'true';
    setIsLoggedIn(loggedIn);
    setMounted(true);
  }, []);

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

  // ===== ضغط الصورة قبل الرفع (يقلل الحجم 70-80% بدون فقدان جودة ملحوظ) =====
  const compressImage = (file, maxWidth = 1200, quality = 0.85) =>
    new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, 1); // لا نكبّر الصور الصغيرة
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => { URL.revokeObjectURL(url); resolve(blob || file); },
          'image/jpeg', quality
        );
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });

  // ===== رفع الصورة إلى Supabase Storage =====
  const uploadToStorage = async (file, folder = 'covers') => {
    const compressed = await compressImage(file, folder === 'covers' ? 1200 : 1600, 0.85);
    const formData = new FormData();
    formData.append('file', compressed, file.name);
    formData.append('folder', folder);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'فشل الرفع');
    return data.url;
  };

  // ===== غلاف الكتاب =====
  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingCover(true);
    try {
      const url = await uploadToStorage(file, 'covers');
      setBookForm(p => ({ ...p, cover_url: url }));
      toast.success('تم رفع الغلاف ✅');
    } catch (err) { toast.error('فشل رفع الغلاف: ' + err.message); }
    setUploadingCover(false);
  };

  const handleFileInput = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingCover(true);
    try {
      const url = await uploadToStorage(file, 'covers');
      setBookForm(p => ({ ...p, cover_url: url }));
      toast.success('تم رفع الغلاف ✅');
    } catch (err) { toast.error('فشل رفع الغلاف: ' + err.message); }
    setUploadingCover(false);
  };

  // ===== صور المحتوى المتعددة =====
  const uploadMultipleToStorage = async (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;
    setUploadingImages(true);
    try {
      const urls = await Promise.all(validFiles.map(f => uploadToStorage(f, 'content')));
      setBookForm(p => ({
        ...p,
        images: [...p.images.filter(img => img && img.trim()), ...urls]
      }));
      toast.success(`تم رفع ${urls.length} صورة ✅`);
    } catch (err) { toast.error('فشل رفع الصور: ' + err.message); }
    setUploadingImages(false);
  };

  const handleImagesDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImagesDragOver(false);
    uploadMultipleToStorage(e.dataTransfer.files);
  };

  const handleImagesFileInput = (e) => {
    uploadMultipleToStorage(e.target.files);
    e.target.value = '';
  };

  const handleImageReorder = (targetIdx) => {
    if (dragImgIdx === null || dragImgIdx === targetIdx) return;
    setBookForm(p => {
      const imgs = [...p.images];
      const [moved] = imgs.splice(dragImgIdx, 1);
      imgs.splice(targetIdx, 0, moved);
      return { ...p, images: imgs };
    });
    setDragImgIdx(null);
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
  if (!mounted) return null; // تجنب Hydration Error — ننتظر حتى يُعرف وضع تسجيل الدخول
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
                      <div className={styles.formRow}>
                        <div className="form-group">
                          <label>📚 عدد الأجزاء (اختياري)</label>
                          <input
                            type="number"
                            value={bookForm.parts}
                            onChange={e => setBookForm(p => ({ ...p, parts: e.target.value }))}
                            placeholder="مثال: 3"
                            min="1"
                          />
                        </div>
                        <div className="form-group">
                          <label>📖 عدد المجلدات (اختياري)</label>
                          <input
                            type="number"
                            value={bookForm.volumes}
                            onChange={e => setBookForm(p => ({ ...p, volumes: e.target.value }))}
                            placeholder="مثال: 2"
                            min="1"
                          />
                        </div>
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
                          {uploadingCover ? (
                            <div style={{ color: 'var(--color-secondary)', fontSize: '0.9rem', padding: '8px 0' }}>
                              <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto 8px' }} />
                              جاري رفع الغلاف...
                            </div>
                          ) : bookForm.cover_url ? (
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

                      {/* صور إضافية - Drag & Drop + إعادة ترتيب */}
                      <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FiImage /> صور المحتوى الإضافية
                          {bookForm.images.filter(img => img && img.trim()).length > 0 && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginRight: 'auto' }}>
                              {bookForm.images.filter(img => img && img.trim()).length} صورة • اسحب الصور لإعادة ترتيبها
                            </span>
                          )}
                        </label>

                        {/* منطقة الإفلات */}
                        <div
                          onDrop={handleImagesDrop}
                          onDragOver={e => { e.preventDefault(); setImagesDragOver(true); }}
                          onDragLeave={() => setImagesDragOver(false)}
                          onClick={() => document.getElementById('content-images-input').click()}
                          style={{
                            border: `2px dashed ${imagesDragOver ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                            borderRadius: 10, padding: '18px 12px', textAlign: 'center',
                            background: imagesDragOver ? 'rgba(212,168,83,0.1)' : 'var(--color-bg-warm)',
                            transition: 'all 0.2s', cursor: 'pointer', marginBottom: 12,
                            transform: imagesDragOver ? 'scale(1.01)' : 'scale(1)',
                          }}
                        >
                          {uploadingImages ? (
                            <div style={{ color: 'var(--color-secondary)', fontSize: '0.9rem', padding: '4px 0' }}>
                              <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto 6px' }} />
                              جاري رفع الصور...
                            </div>
                          ) : (
                            <>
                              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>📸</div>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>اسحب صور هنا أو اضغط للاختيار</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                                يمكنك اختيار أكثر من صورة دفعة واحدة • PNG, JPG, WEBP
                              </div>
                            </>
                          )}
                        </div>
                        <input
                          id="content-images-input"
                          type="file"
                          accept="image/*"
                          multiple
                          style={{ display: 'none' }}
                          onChange={handleImagesFileInput}
                        />

                        {/* شبكة المعاينة مع إعادة الترتيب */}
                        {bookForm.images.filter(img => img && img.trim()).length > 0 && (
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                            gap: 10, marginBottom: 10,
                          }}>
                            {bookForm.images.map((img, idx) => {
                              if (!img || !img.trim()) return null;
                              return (
                                <div
                                  key={idx}
                                  draggable
                                  onDragStart={() => setDragImgIdx(idx)}
                                  onDragEnd={() => setDragImgIdx(null)}
                                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                                  onDrop={e => { e.stopPropagation(); handleImageReorder(idx); }}
                                  style={{
                                    position: 'relative',
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    border: `2px solid ${dragImgIdx === idx ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                                    cursor: 'grab',
                                    aspectRatio: '1',
                                    background: 'var(--color-bg-warm)',
                                    opacity: dragImgIdx === idx ? 0.45 : 1,
                                    transition: 'all 0.15s',
                                    boxShadow: dragImgIdx === idx ? '0 4px 16px rgba(0,0,0,0.2)' : 'none',
                                  }}
                                >
                                  <img
                                    src={img}
                                    alt={`صورة ${idx + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
                                    onError={e => { e.target.style.opacity = '0.2'; }}
                                  />
                                  {/* رقم الترتيب */}
                                  <div style={{
                                    position: 'absolute', bottom: 4, right: 4,
                                    background: 'rgba(0,0,0,0.65)', color: 'white',
                                    borderRadius: 4, padding: '1px 6px',
                                    fontSize: '0.65rem', fontWeight: 700,
                                  }}>{idx + 1}</div>
                                  {/* زر الحذف */}
                                  <button
                                    type="button"
                                    onClick={() => setBookForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))}
                                    style={{
                                      position: 'absolute', top: 4, left: 4,
                                      background: 'rgba(231,76,60,0.9)', color: 'white',
                                      border: 'none', borderRadius: '50%',
                                      width: 22, height: 22, cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: '0.75rem', lineHeight: 1, padding: 0,
                                    }}
                                    title="حذف"
                                  >✕</button>
                                  {/* مقبض السحب */}
                                  <div style={{
                                    position: 'absolute', top: 4, right: 4,
                                    color: 'rgba(255,255,255,0.85)', fontSize: '1rem',
                                    pointerEvents: 'none', lineHeight: 1, textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                                  }}>⠿</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* إضافة رابط URL */}
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input
                            type="url"
                            placeholder="أو أضف رابط صورة (https://...) واضغط Enter"
                            style={{ flex: 1 }}
                            id="image-url-input"
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const url = e.target.value.trim();
                                if (url) {
                                  setBookForm(p => ({ ...p, images: [...p.images.filter(img => img && img.trim()), url] }));
                                  e.target.value = '';
                                }
                              }
                            }}
                          />
                        </div>
                        <small style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', marginTop: 4, display: 'block' }}>
                          اضغط Enter لإضافة الرابط • اسحب الصور الصغيرة لتغيير ترتيبها
                        </small>
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
