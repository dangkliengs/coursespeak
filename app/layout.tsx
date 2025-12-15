import "../styles/globals.css";
import React from "react";
import Script from "next/script";
import dynamic from "next/dynamic";
import type { Metadata } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://coursespeak.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Coursespeak Deals",
  description: "Find the best course deals and coupons",
  metadataBase: new URL(SITE_URL),
};

import NewsletterSignupWrapper from "../components/NewsletterSignupWrapper";

// Dynamic import for client component
const HeaderSearch = dynamic(() => import("@/components/HeaderSearch"));

const exploreLinks = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/search", label: "Search courses" },
  { href: "/udemy-coupons", label: "Udemy coupons" },
];

const popularLinks = [
  { href: "/udemy-coupons", label: "100% off Udemy" },
  { href: "/?provider=udemy", label: "Udemy deals" },
  { href: "/?sort=rating", label: "Top rated" },
  { href: "/categories", label: "Popular topics" },
];

const companyLinks = [
  { href: "/post/udemy-coupons-guide", label: "Udemy coupon guide" },
  { href: "/post/how-to-redeem-udemy-coupons", label: "Redeem coupons" },
  { href: "/contact", label: "Contact" },
];

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Coursespeak",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Coursespeak",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const currentYear = new Date().getFullYear();
  return (
    <html lang="en">
      <body>
        {/* Google Analytics */}
        <Script
          id="gtag-base"
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-VPY4HMMKBH"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-VPY4HMMKBH');
            `,
          }}
        />
        {/* Google AdSense Auto Ads */}
        <Script
          id="adsense-auto"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8220442576502761"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Organization & WebSite JSON-LD for SEO */}
        <Script id="jsonld-organization" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <Script id="jsonld-website" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <header className="site-header">
          <div className="container">
            <div style={{ margin: 0, lineHeight: 0 }}>
              <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }} aria-label="Coursespeak Home">
                {/* Inline SVG logo to avoid asset loading issues */}
                <svg xmlns="http://www.w3.org/2000/svg" width="176" height="32" viewBox="0 0 220 48" aria-hidden>
                  <defs>
                    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <g transform="translate(0,0)">
                    <rect x="0" y="0" width="220" height="48" rx="10" fill="#0f1320"/>
                    <g transform="translate(10,8)">
                      <rect x="0" y="0" width="32" height="32" rx="8" fill="url(#g)"/>
                      <path d="M9 22c0-4.97 4.03-9 9-9 2.2 0 4.22.78 5.8 2.08l-2.1 2.1A6.5 6.5 0 0 0 18 15.5c-3.04 0-5.5 2.46-5.5 5.5s2.46 5.5 5.5 5.5a6.5 6.5 0 0 0 6.08-4.7l2.36.69A9 9 0 0 1 18 31c-4.97 0-9-4.03-9-9z" fill="#0b0d12" opacity=".9"/>
                    </g>
                    <g>
                      <text x="52" y="30" fontFamily="Inter, Segoe UI, Arial, sans-serif" fontSize="20" fontWeight="700" fill="#eaf4ff">Coursespeak</text>
                      <text x="52" y="42" fontFamily="Inter, Segoe UI, Arial, sans-serif" fontSize="10" fill="#9db7ff">Deals & Coupons</text>
                    </g>
                  </g>
                </svg>
              </a>
            </div>
            <nav
              style={{
                display: "flex",
                gap: "1.5rem",
                alignItems: "center",
                flex: 1,
                justifyContent: "flex-end",
              }}
            >
              <a href="/" className="nav-link">
                Home
              </a>
              <a href="/categories" className="nav-link">
                Categories
              </a>
              <a href="/search" className="nav-link">
                Courses
              </a>
              <a href="/contact" className="nav-link">
                Contact
              </a>
              <div suppressHydrationWarning={true}>
                <HeaderSearch />
              </div>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <div className="container" style={{ display: "grid", gap: 32 }}>
            <section>
              <NewsletterSignupWrapper />
            </section>
            <div
              style={{
                display: "grid",
                gap: 24,
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                alignItems: "start",
              }}
            >
              <div>
                <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>Explore</h3>
                <nav style={{ display: "grid", gap: 8 }}>
                  {exploreLinks.map((link) => (
                    <a key={link.href} href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
              <div>
                <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>Popular topics</h3>
                <nav style={{ display: "grid", gap: 8 }}>
                  {popularLinks.map((link) => (
                    <a key={link.href} href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
              <div>
                <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>Company</h3>
                <nav style={{ display: "grid", gap: 8 }}>
                  {companyLinks.map((link) => (
                    <a key={link.href} href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
            {/* Socials row (icons only) */}
            <div style={{ display: "flex", gap: 10 }}>
              <a href="https://x.com/courses_peak" className="footer-link" target="_blank" rel="noopener noreferrer" aria-label="Twitter" title="Twitter">
                <span style={{ display: "inline-flex", width: 28, height: 28, borderRadius: 999, alignItems: "center", justifyContent: "center", background: "#1DA1F2" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                    <path d="M18.244 2H21.5l-7.5 8.568L22.5 22h-6.2l-4.85-5.68L5.8 22H2.5l8.06-9.2L2.5 2h6.3l4.41 5.136L18.244 2zm-1.086 18h1.59L8.94 4h-1.59l9.808 16z"/>
                  </svg>
                </span>
              </a>
              <a href="https://www.facebook.com/giftcourse.online" className="footer-link" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook">
                <span style={{ display: "inline-flex", width: 28, height: 28, borderRadius: 999, alignItems: "center", justifyContent: "center", background: "#1877F2" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                    <path d="M22 12.07C22 6.49 17.52 2 11.93 2S2 6.49 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.75 8.44-4.9 8.44-9.93z"/>
                  </svg>
                </span>
              </a>
              <a href="https://www.linkedin.com/company/couponos-me/" className="footer-link" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
                <span style={{ display: "inline-flex", width: 28, height: 28, borderRadius: 999, alignItems: "center", justifyContent: "center", background: "#0A66C2" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                    <path d="M19 3A2.94 2.94 0 0 1 22 6v12a2.94 2.94 0 0 1-3 3H5a2.94 2.94 0 0 1-3-3V6a2.94 2.94 0 0 1 3-3h14ZM8.34 17.34v-7H5.66v7h2.68Zm-.99-8a1.35 1.35 0 1 0-.02-2.7 1.35 1.35 0 0 0 .02 2.7ZM18.34 17.34v-3.76c0-2-1.07-2.94-2.5-2.94-1.15 0-1.67.64-1.96 1.09v-0.94h-2.68s.04 1.52 0 7h2.68v-3.91c0-.21.02-.42.08-.57.18-.42.6-.86 1.3-.86.92 0 1.29.65 1.29 1.6v3.74h2.69Z"/>
                  </svg>
                </span>
              </a>
              <a href="https://github.com/Coutons" className="footer-link" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
                <span style={{ display: "inline-flex", width: 28, height: 28, borderRadius: 999, alignItems: "center", justifyContent: "center", background: "#333333" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                    <path d="M12 .5A11.5 11.5 0 0 0 .5 12.17c0 5.16 3.35 9.54 8 11.09.58.11.8-.26.8-.57v-2c-3.26.72-3.95-1.4-3.95-1.4-.53-1.37-1.29-1.73-1.29-1.73-1.06-.74.08-.72.08-.72 1.18.09 1.8 1.23 1.8 1.23 1.04 1.83 2.73 1.3 3.4.99.11-.77.41-1.3.74-1.6-2.6-.3-5.33-1.33-5.33-5.94 0-1.31.46-2.38 1.23-3.22-.12-.3-.53-1.52.11-3.17 0 0 .99-.32 3.24 1.23a11.1 11.1 0 0 1 5.9 0c2.25-1.55 3.24-1.23 3.24-1.23.64 1.65.23 2.87.11 3.17.77.84 1.23 1.91 1.23 3.22 0 4.62-2.74 5.64-5.35 5.94.42.37.79 1.1.79 2.22v3.29c0 .32.21.7.81.58a11.5 11.5 0 0 0 7.69-10.92A11.5 11.5 0 0 0 12 .5Z"/>
                  </svg>
                </span>
              </a>
              <a href="https://t.me/Coursespeak" className="footer-link" target="_blank" rel="noopener noreferrer" aria-label="Telegram" title="Telegram">
                <span style={{ display: "inline-flex", width: 28, height: 28, borderRadius: 999, alignItems: "center", justifyContent: "center", background: "#229ED9" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                    <path d="M21.944 4.84c.26-1.01-.78-1.87-1.72-1.45L2.66 11.16c-1.08.49-1.01 2.08.1 2.47l4.73 1.76 1.81 4.86c.42 1.13 1.99 1.24 2.55.18l2.29-4.3 4.71 3.46c.92.68 2.24.17 2.48-.95l2.55-12.84Zm-4.24 2.4-8.9 7.84c-.14.12-.23.3-.25.48l-.3 2.56c-.03.28-.43.3-.52.03l-1.15-3.56c-.07-.2.01-.42.2-.53l10.63-6.14c.28-.16.56.22.29.43Z"/>
                  </svg>
                </span>
              </a>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", color: "#6b7280", fontSize: 13 }}>
              <div>© {currentYear} Coursespeak. All rights reserved.</div>
              <div style={{ display: "flex", gap: 12 }}>
                <a href="/privacy" className="footer-link">Privacy</a>
                <a href="/terms" className="footer-link">Terms</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
