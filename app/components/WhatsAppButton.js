'use client';

import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/9647725754850?text=مرحباً، أريد الاستفسار عن كتاب من المكتبة الحيدرية"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="تواصل معنا عبر واتساب"
      id="whatsapp-float-btn"
    >
      <FaWhatsapp />
    </a>
  );
}
