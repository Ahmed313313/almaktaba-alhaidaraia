export default function sitemap() {
  const baseUrl = 'https://almaktaba-alhaidaraia.web.app';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/store`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/track`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  // Book pages - using IDs now instead of slugs
  const bookIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const bookPages = bookIds.map(id => ({
    url: `${baseUrl}/book/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...bookPages];
}
