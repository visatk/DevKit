import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface FAQ {
  question: string;
  answer: string;
}

interface SeoHeadProps {
  title: string;
  description: string;
  keywords?: string;
  isTool?: boolean;
  image?: string;
  faqData?: FAQ[];
  author?: string;
}

export function SeoHead({ 
  title, 
  description, 
  keywords, 
  isTool = false, 
  image = '/logo.svg', 
  faqData,
  author = 'DevKit Pro Team'
}: SeoHeadProps) {
  const location = useLocation();
  const baseUrl = 'https://visatk.us';
  const currentUrl = `${baseUrl}${location.pathname}`;
  const siteName = 'DevKit Pro';
  const fullTitle = isTool ? `${title} | ${siteName} Tools` : `${title} | ${siteName}`;
  
  // Use a ref to track elements safely across concurrent renders
  const managedElements = useRef<Set<Element>>(new Set());

  useEffect(() => {
    document.title = fullTitle;
    const elementsToCleanup = new Set<Element>();
    
    const upsertTag = (tagName: string, attributes: Record<string, string>) => {
      // Create unique selector based on defining attributes
      const isMeta = tagName === 'meta';
      const keyAttr = isMeta ? (attributes.name ? 'name' : 'property') : 'rel';
      const selector = `${tagName}[${keyAttr}="${attributes[keyAttr]}"]`;
      
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement(tagName);
        document.head.appendChild(element);
        elementsToCleanup.add(element);
      }
      
      Object.entries(attributes).forEach(([key, value]) => {
        element!.setAttribute(key, value);
      });
    };

    // 1. Performance Hints (Resource Hints)
    upsertTag('link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' });
    upsertTag('link', { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' });

    // 2. Core SEO Metrics
    upsertTag('meta', { name: 'description', content: description });
    upsertTag('meta', { name: 'author', content: author });
    if (keywords) upsertTag('meta', { name: 'keywords', content: keywords });
    upsertTag('meta', { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' });
    
    // 3. Canonical URLs (Critical for SPA Duplicate Content Penalties)
    upsertTag('link', { rel: 'canonical', href: currentUrl });

    // 4. OpenGraph Architecture
    upsertTag('meta', { property: 'og:type', content: isTool ? 'product' : 'website' });
    upsertTag('meta', { property: 'og:url', content: currentUrl });
    upsertTag('meta', { property: 'og:title', content: fullTitle });
    upsertTag('meta', { property: 'og:description', content: description });
    upsertTag('meta', { property: 'og:image', content: `${baseUrl}${image}` });
    upsertTag('meta', { property: 'og:site_name', content: siteName });

    // 5. Twitter Card Protocol
    upsertTag('meta', { name: 'twitter:card', content: 'summary_large_image' });
    upsertTag('meta', { name: 'twitter:title', content: fullTitle });
    upsertTag('meta', { name: 'twitter:description', content: description });
    upsertTag('meta', { name: 'twitter:image', content: `${baseUrl}${image}` });

    // 6. JSON-LD Structured Data Engineering
    let structuredData = document.querySelector('script#json-ld-data') as HTMLScriptElement;
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.id = 'json-ld-data';
      structuredData.type = 'application/ld+json';
      document.head.appendChild(structuredData);
      elementsToCleanup.add(structuredData);
    }
    
    const schemas: any[] = [];

    // Base Application Context
    schemas.push(isTool ? {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": fullTitle,
      "description": description,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "All",
      "url": currentUrl,
      "image": `${baseUrl}${image}`,
      "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "USD" },
      "publisher": { "@type": "Organization", "name": siteName, "logo": { "@type": "ImageObject", "url": `${baseUrl}/logo.svg` } }
    } : {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteName,
      "url": baseUrl,
      "description": description
    });

    // Integrated FAQ Injection
    if (faqData && faqData.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
        }))
      });
    }
    
    structuredData.textContent = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
    managedElements.current = elementsToCleanup;

    // Strict SPA Cleanup Protocol
    return () => {
      managedElements.current.forEach(el => {
        if (document.head.contains(el)) {
          document.head.removeChild(el);
        }
      });
      managedElements.current.clear();
    };

  }, [fullTitle, description, keywords, currentUrl, isTool, image, baseUrl, faqData, author]);

  return null;
}
