import './globals.css';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './components/CartProvider';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import WhatsAppButton from './components/WhatsAppButton';

export const metadata = {
  title: {
    default: 'المكتبة الحيدرية | متجر كتب إلكتروني - شراء كتب أونلاين في العراق',
    template: '%s | المكتبة الحيدرية',
  },
  description: 'المكتبة الحيدرية - وجهتكم الأولى لشراء الكتب أونلاين في العراق. تشكيلة واسعة من الكتب الدينية والفكرية والأدبية مع خدمة توصيل لجميع المحافظات. كتب منتقاة بعناية وتشكيلة متنوعة.',
  keywords: ['المكتبة الحيدرية', 'كتب', 'شراء كتب أونلاين', 'متجر كتب', 'كتب دينية', 'روايات', 'توصيل كتب العراق', 'مكتبة إلكترونية'],
  authors: [{ name: 'المكتبة الحيدرية' }],
  openGraph: {
    title: 'المكتبة الحيدرية | متجر كتب إلكتروني',
    description: 'وجهتكم الأولى لشراء الكتب أونلاين في العراق مع توصيل لجميع المحافظات.',
    type: 'website',
    locale: 'ar_IQ',
    siteName: 'المكتبة الحيدرية',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'المكتبة الحيدرية | متجر كتب إلكتروني',
    description: 'شراء كتب أونلاين في العراق مع توصيل لجميع المحافظات',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <meta name="theme-color" content="#1a1a2e" />
        <meta name="google-site-verification" content="" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('theme');
              if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.setAttribute('data-theme', 'dark');
              }
            } catch(e) {}
          })();
        `}} />
        {/* Schema.org - LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BookStore',
              name: 'المكتبة الحيدرية',
              alternateName: 'AL-HAIDARIYA LIBRARY',
              description: 'متجر كتب إلكتروني متكامل - شراء كتب أونلاين في العراق مع توصيل لجميع المحافظات',
              url: 'https://almaktaba-alhaidaraia.vercel.app',
              sameAs: [
                'https://www.instagram.com/almaktaba_alhaidaraia',
                'https://www.facebook.com/almaktaba_alhaidaraia',
                'https://www.tiktok.com/@almaktaba_alhaidaraia1',
              ],
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'IQ',
                addressRegion: 'النجف',
              },
              priceRange: '$$',
              paymentAccepted: 'Cash',
              currenciesAccepted: 'IQD',
            }),
          }}
        />
      </head>
      <body>
        <CartProvider>
          <Header />
          <main style={{ minHeight: 'calc(100vh - var(--header-height) - 100px)' }}>
            {children}
          </main>
          <Footer />
          <CartSidebar />
          <WhatsAppButton />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                direction: 'rtl',
                fontFamily: 'var(--font-main)',
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
