export default function sitemap() {
  return [
    {
      url: 'https://pixelpirate.vercel.app', // IMPORTANT: Change this to your actual domain
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}