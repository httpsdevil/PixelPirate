export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://pixelpirate.vercel.app/sitemap.xml', // IMPORTANT: Change this to your actual domain
  };
}