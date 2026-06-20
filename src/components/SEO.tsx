import { useEffect } from "react";

interface SEOMetadata {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
}

interface SEOProps {
  metadata: SEOMetadata;
}

const BASE_URL = "https://burnersol.io";

export default function SEO({ metadata }: SEOProps) {
  useEffect(() => {
    document.title = metadata.title;
    document.documentElement.lang = "en";

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", metadata.description);

    const robots = document.querySelector('meta[name="robots"]');
    if (robots && metadata.noIndex) {
      robots.setAttribute("content", "noindex, nofollow");
    } else if (robots) {
      robots.setAttribute("content", "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", metadata.title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", metadata.description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", metadata.canonical || BASE_URL);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute("content", metadata.ogImage || `${BASE_URL}/token-logo.png`);

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", metadata.title);

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute("content", metadata.description);

    const linkCanonical = document.querySelector('link[rel="canonical"]');
    if (linkCanonical) linkCanonical.setAttribute("href", metadata.canonical || BASE_URL);

    return () => {
      document.title = "Recover SOL | Solana Wallet Cleaner & Rent Recovery Tool | BurnerSOL";
    };
  }, [metadata]);

  return null;
}