import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts';
import { portfolios } from '@/data';
import type { FC } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

const SITE_URL = 'https://ganipedia.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/ganipedia-logo.jpg`;

export const SEOHead: FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image = DEFAULT_OG_IMAGE,
  url,
}) => {
  const { language } = useLanguage();

  const seoData = {
    id: {
      title: title || 'Ganipedia - Jasa Pembuatan Website Profesional',
      description:
        description ||
        'Ganipedia membantu bisnis & instansi Anda berkembang dengan solusi website modern, cepat, dan scalable: company profile, e-commerce, dashboard admin, dan sistem custom.',
      keywords:
        keywords ||
        'jasa pembuatan website, web developer indonesia, jasa website bandung, company profile, ecommerce, dashboard admin, laravel developer, react developer',
    },
    en: {
      title: title || 'Ganipedia - Professional Website Development Services',
      description:
        description ||
        'Ganipedia helps your business grow with modern, fast and scalable web solutions: company profiles, e-commerce, admin dashboards, and custom systems.',
      keywords:
        keywords ||
        'web development services, indonesia web developer, company profile website, ecommerce development, admin dashboard, laravel developer, react developer',
    },
  } as const;

  const currentUrl = url || `${SITE_URL}/${language}`;
  const { title: seoTitle, description: seoDescription, keywords: seoKeywords } = seoData[language];

  // Organization
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ganipedia',
    description: seoDescription,
    url: SITE_URL,
    logo: `${SITE_URL}/ganipedia-logo.jpg`,
    image: `${SITE_URL}/ganipedia-logo.jpg`,
    sameAs: [
      'https://www.instagram.com/ganipedia',
      'https://www.linkedin.com/company/ganipedia',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+62-812-3456-7890',
      contactType: 'Customer Service',
      availableLanguage: ['Indonesian', 'English'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bandung',
      addressCountry: 'ID',
    },
  };

  // Website (sitelinks search box)
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Ganipedia',
    url: SITE_URL,
    inLanguage: language === 'id' ? 'id-ID' : 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // Portfolio as ItemList for richer SERP coverage
  const portfolioItemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: language === 'id' ? 'Portofolio Ganipedia' : 'Ganipedia Portfolio',
    itemListElement: portfolios.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'CreativeWork',
        name: p.title,
        description: p.description,
        image: `${SITE_URL}${p.image}`,
        url: p.link || currentUrl,
        keywords: p.technologies.join(', '),
        genre: p.category,
      },
    })),
  };

  return (
    <Helmet>
      <html lang={language} />
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <link rel="canonical" href={currentUrl} />

      {/* Alternate language links */}
      <link rel="alternate" hrefLang="id" href={`${SITE_URL}/id`} />
      <link rel="alternate" hrefLang="en" href={`${SITE_URL}/en`} />
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/id`} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content="Ganipedia" />
      <meta property="og:locale" content={language === 'id' ? 'id_ID' : 'en_US'} />
      <meta property="og:locale:alternate" content={language === 'id' ? 'en_US' : 'id_ID'} />
      <meta property="og:site_name" content="Ganipedia" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content="Ganipedia" />

      {/* Additional SEO */}
      <meta name="author" content="Ganipedia" />
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta name="googlebot" content="index, follow" />

      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(organizationData)}</script>
      <script type="application/ld+json">{JSON.stringify(websiteData)}</script>
      <script type="application/ld+json">{JSON.stringify(portfolioItemList)}</script>
    </Helmet>
  );
};
