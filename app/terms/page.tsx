import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Coursespeak",
  description: "Understand the terms that govern your use of Coursespeak coupons, deals, and resources.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | Coursespeak",
    description: "Review Coursespeak's user responsibilities, acceptable use, and legal notices.",
    type: "article",
    url: "/terms",
  },
};

const UPDATED_DATE = "2025-09-30";

export default function TermsPage() {
  return (
    <div style={{ display: "grid", gap: 32 }}>
      <section
        style={{
          borderRadius: 20,
          padding: "32px 28px",
          display: "grid",
          gap: 12,
          border: "1px solid rgba(91, 140, 255, 0.24)",
          background: "linear-gradient(140deg, rgba(11, 13, 18, 0.98) 0%, rgba(18, 24, 40, 0.98) 55%, rgba(42, 64, 110, 0.38) 100%)",
          boxShadow: "0 18px 36px rgba(8, 12, 26, 0.45)",
        }}
      >
        <span style={{ color: "var(--brand)", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Terms of service</span>
        <h1 style={{ margin: 0 }}>The rules for using Coursespeak</h1>
        <p className="muted" style={{ margin: 0, maxWidth: 760 }}>
          These terms describe the expectations when accessing Coursespeak, submitting coupons, or subscribing to our updates. By using the site, you
          agree to the conditions explained below.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "#a9b0c0" }}>
          <span>Last updated <time dateTime={UPDATED_DATE}>September 30, 2025</time></span>
          <span>Applies to all Coursespeak visitors</span>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>Using Coursespeak responsibly</h2>
          <ul style={{ margin: 0, paddingLeft: 20, color: "#cbd5f5", display: "grid", gap: 8 }}>
            <li>Only submit coupons or deals you believe are valid and lawful.</li>
            <li>Do not attempt to interfere with site security, rate limits, or data sources.</li>
            <li>Refrain from automated scraping without a prior agreement from Coursespeak.</li>
          </ul>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>Intellectual property</h2>
          <p className="muted" style={{ margin: 0 }}>
            All original content, branding, and interface elements are owned by Coursespeak. You may reference our materials with attribution, but
            reselling or duplicating the experience without permission is prohibited.
          </p>
          <p className="muted" style={{ margin: 0 }}>
            Third-party trademarks, such as Udemy, belong to their respective owners. We surface deals but do not claim ownership over external
            course content or provider marks.
          </p>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>Disclaimer of warranties</h2>
          <p className="muted" style={{ margin: 0 }}>
            Coursespeak provides coupons and information &quot;as is&quot; without guarantees about availability, accuracy, or outcomes. Prices and coupon status
            may change without notice, and we are not responsible for losses resulting from expired promotions or third-party issues.
          </p>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>Limitation of liability</h2>
          <p className="muted" style={{ margin: 0 }}>
            To the fullest extent permitted by law, Coursespeak will not be liable for indirect, incidental, or consequential damages arising from your use
            of the site. If you are dissatisfied with Coursespeak, your sole remedy is to discontinue using the service.
          </p>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>Contact and updates</h2>
          <p className="muted" style={{ margin: 0 }}>
            We will post revisions to these terms on this page. You are encouraged to review them regularly. For questions about the agreement, email
            <a href="mailto:legal@coursespeak.com" className="footer-link">legal@coursespeak.com</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
