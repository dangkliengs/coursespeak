'use client';

import dynamic from 'next/dynamic';

const NewsletterSignupCard = dynamic(() => import("./NewsletterSignupCard"), {
  ssr: false,
  loading: () => (
    <div
      className="card brand-gradient brand-border"
      style={{ padding: 24, borderRadius: 12, display: "grid", gap: 12 }}
    >
      <div style={{ height: 12, background: "var(--brand-soft)", borderRadius: 999 }} />
      <div style={{ height: 12, background: "var(--brand-glow)", borderRadius: 999, width: "80%" }} />
      <div style={{ height: 44, background: "var(--brand-soft)", borderRadius: 999, width: "70%" }} />
    </div>
  ),
});

export default function NewsletterSignupWrapper() {
  return <NewsletterSignupCard />;
}
