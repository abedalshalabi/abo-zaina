import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  url?: string;
  structuredData?: object;
  noindex?: boolean;
  canonical?: string;
}

const SEO = ({
  title = 'أبو زينة للتقنيات - عالم التكنولوجيا والأجهزة الكهربائية',
  description = 'تسوق أونلاين من أبو زينة للتقنيات - أفضل متجر للأجهزة الكهربائية والإلكترونية في فلسطين. أفران، ثلاجات، غسالات، تلفزيونات، هواتف ذكية وأكثر. توصيل سريع وضمان شامل.',
  keywords = 'أجهزة كهربائية, إلكترونيات, أفران, ثلاجات, غسالات, تلفزيونات, هواتف ذكية, تسوق أونلاين, أبو زينة, فلسطين',
  image = '/placeholder.svg',
  type = 'website',
  url,
  structuredData,
  noindex = false,
  canonical
}: SEOProps) => {
  const location = useLocation();
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const currentUrl = url || `${siteUrl}${location.pathname}${location.search}`;
  const canonicalUrl = canonical || currentUrl;
  // Ensure image URL is absolute
  let fullImageUrl = image;
  if (!image.startsWith('http')) {
    fullImageUrl = image.startsWith('/') ? `${siteUrl}${image}` : `${siteUrl}/${image}`;
  }

  useEffect(() => {
    // Update document title
    document.title = title;

    // Remove existing meta tags
    const removeMetaTag = (attribute: string, value: string) => {
      const existing = document.querySelector(`meta[${attribute}="${value}"]`);
      if (existing) {
        existing.remove();
      }
    };

    // Remove existing structured data
    const existingStructuredData = document.querySelector('script[type="application/ld+json"]');
    if (existingStructuredData) {
      existingStructuredData.remove();
    }

    // Helper to set or update meta tag
    const setMetaTag = (attribute: string, value: string, content: string) => {
      removeMetaTag(attribute, value);
      const meta = document.createElement('meta');
      meta.setAttribute(attribute, value);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    };

    // Basic meta tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'viewport', 'width=device-width, initial-scale=1.0');
    setMetaTag('charset', 'charset', 'UTF-8');

    // Open Graph tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', fullImageUrl);
    setMetaTag('property', 'og:image:url', fullImageUrl);
    setMetaTag('property', 'og:image:secure_url', fullImageUrl);
    setMetaTag('property', 'og:image:type', 'image/jpeg');
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:locale', 'ar_SA');
    setMetaTag('property', 'og:site_name', 'أبو زينة للتقنيات');
    
    // Logo for search engines (Google)
    setMetaTag('itemprop', 'logo', fullImageUrl);
    
    // Add logo link tag
    let logoLink = document.querySelector('link[rel="image_src"]') as HTMLLinkElement;
    if (!logoLink) {
      logoLink = document.createElement('link');
      logoLink.setAttribute('rel', 'image_src');
      document.head.appendChild(logoLink);
    }
    logoLink.setAttribute('href', fullImageUrl);

    // Twitter Card tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', fullImageUrl);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Robots meta
    if (noindex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      setMetaTag('name', 'robots', 'index, follow');
    }

    // Language and direction
    document.documentElement.setAttribute('lang', 'ar');
    document.documentElement.setAttribute('dir', 'rtl');

    // Add structured data
    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [title, description, keywords, image, type, currentUrl, canonicalUrl, fullImageUrl, structuredData, noindex]);

  return null;
};

export default SEO;

