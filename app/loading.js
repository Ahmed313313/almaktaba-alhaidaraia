export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - var(--header-height))',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <div className="spinner" />
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        جاري التحميل...
      </p>
    </div>
  );
}
