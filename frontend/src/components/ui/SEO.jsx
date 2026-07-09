import { Helmet } from 'react-helmet-async';

// Set VITE_SITE_URL in .env.production to your real domain — this is what
// canonical/OG/Twitter URLs are built from, so it has to be correct before
// launch (defaults to localhost so dev builds never claim a real domain).
const SITE_URL = (import.meta.env.VITE_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const SITE_NAME = 'OboiShop';
const DEFAULT_TITLE = `${SITE_NAME} — Zamonaviy oboylar va 3D vizualizatsiya`;
const DEFAULT_DESCRIPTION = "Uyingiz uchun eng zamonaviy va sifatli oboylar. Sotib olishdan oldin devoringizda 3D vizualizatsiya orqali qanday ko'rinishini his qiling.";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

export default function SEO({ title, description, image, path = '', type = 'website', structuredData, noindex = false }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;
  const url = `${SITE_URL}${path}`;
  const img = image || DEFAULT_IMAGE;
  const jsonLd = Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="uz_UZ" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />

      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(data)}</script>
      ))}
    </Helmet>
  );
}

export { SITE_URL, SITE_NAME };
