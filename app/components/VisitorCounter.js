'use client';

import { useState, useEffect } from 'react';
import { FiEye } from 'react-icons/fi';

export default function VisitorCounter({ variant = 'default' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const visited = sessionStorage.getItem('visited');
    if (!visited) {
      fetch('/api/visitors', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success) setCount(data.total);
          sessionStorage.setItem('visited', 'true');
        })
        .catch(() => {});
    } else {
      fetch('/api/visitors')
        .then(res => res.json())
        .then(data => { if (data.success) setCount(data.total); })
        .catch(() => {});
    }
  }, []);

  if (count === 0) return null;

  if (variant === 'footer') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '8px 16px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '20px',
        fontSize: '0.8rem',
        color: 'rgba(245, 240, 232, 0.6)',
        marginTop: '12px',
      }}>
        <FiEye style={{ fontSize: '0.9rem' }} />
        <span>{count.toLocaleString('ar-IQ')} زائر</span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    }}>
      <strong style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-secondary)' }}>
        <FiEye style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
        {count.toLocaleString('ar-IQ')}
      </strong>
      <span style={{ fontSize: '0.8rem', color: 'rgba(245, 240, 232, 0.6)' }}>زائر</span>
    </div>
  );
}
