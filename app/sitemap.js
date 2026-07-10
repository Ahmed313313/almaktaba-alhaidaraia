import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function sitemap() {
  const baseUrl = 'https://almaktaba-alhaidaraia.vercel.app';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/store`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/track`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  // جلب الكتب من Supabase
  let bookPages = [];
  try {
    const { data } = await supabase
      .from('books')
      .select('id, created_at')
      .order('created_at', { ascending: false });

    if (data) {
      bookPages = data.map(book => ({
        url: `${baseUrl}/book/${book.id}`,
        lastModified: new Date(book.created_at),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error('Sitemap error:', e);
  }

  return [...staticPages, ...bookPages];
}
