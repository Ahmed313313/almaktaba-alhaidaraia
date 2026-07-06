import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - var(--header-height) - 200px)',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📚</div>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
        404 - الصفحة غير موجودة
      </h1>
      <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem', fontSize: '1.1rem' }}>
        عذراً، الصفحة التي تبحث عنها غير موجودة
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" className="btn btn-primary">العودة للرئيسية</Link>
        <Link href="/store" className="btn btn-outline">تصفح الكتب</Link>
      </div>
    </div>
  );
}
