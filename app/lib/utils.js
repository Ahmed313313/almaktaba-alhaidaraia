// Utility functions for the library website

export function formatPrice(price) {
  if (!price && price !== 0) return '';
  return new Intl.NumberFormat('ar-IQ').format(price);
}

export function getStockStatus(stock) {
  if (stock === 0) return { label: 'نفدت الكمية حالياً', class: 'stock-out', color: 'danger' };
  if (stock <= 3) return { label: `متبقي ${stock} نسخ فقط!`, class: 'stock-low', color: 'warning' };
  return { label: `متوفر: ${stock} نسخة`, class: 'stock-available', color: 'success' };
}

export function generateSlug(title) {
  return title
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '')
    .toLowerCase();
}

export function getWhatsAppLink(orderDetails) {
  const phone = '9647700000000'; // Replace with actual WhatsApp number
  const message = encodeURIComponent(orderDetails);
  return `https://wa.me/${phone}?text=${message}`;
}

export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export const PROVINCES = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء',
  'ذي قار', 'ميسان', 'واسط', 'ديالى', 'الأنبار', 'صلاح الدين',
  'بابل', 'كركوك', 'المثنى', 'القادسية', 'دهوك', 'السليمانية'
];
