import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Coursespeak",
  description: "Learn how Coursespeak collects, uses, and protects your data while browsing coupons and course deals.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | Coursespeak",
    description: "Understand the data practices, security measures, and your rights when using Coursespeak.",
    type: "article",
    url: "/privacy",
  },
};

const UPDATED_DATE = "2025-09-30";

export default function PrivacyPage() {
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
        <span style={{ color: "var(--brand)", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Privacy policy</span>
        <h1 style={{ margin: 0 }}>How Coursespeak protects your data</h1>
        <p className="muted" style={{ margin: 0, maxWidth: 760 }}>
          We respect your privacy and are committed to safeguarding your personal information. This policy explains what data we collect, why we
          collect it, and the controls you have while using Coursespeak.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "#a9b0c0" }}>
          <span>Last updated <time dateTime={UPDATED_DATE}>September 30, 2025</time></span>
          <span>Applies to all Coursespeak experiences</span>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>Information we collect</h2>
          <p className="muted" style={{ margin: 0 }}>
            We gather minimal data to keep Coursespeak running smoothly and to deliver the best coupon experience.
          </p>
          <ul style={{ margin: 0, paddingLeft: 20, color: "#cbd5f5", display: "grid", gap: 8 }}>
            <li>Account and contact details you provide when subscribing to the newsletter.</li>
            <li>Anonymous analytics, device, and referral data that help us understand site performance.</li>
            <li>Support requests, survey responses, and feedback you voluntarily share with our team.</li>
          </ul>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>How we use your data</h2>
          <p className="muted" style={{ margin: 0 }}>
            Coursespeak only uses collected information to operate and improve our services. Specifically, we:
          </p>
          <ol style={{ margin: 0, paddingLeft: 20, color: "#cbd5f5", display: "grid", gap: 8 }}>
            <li>Deliver newsletters and coupon alerts you opt into.</li>
            <li>Monitor coupon health, clicks, and errors to maintain an accurate deals catalog.</li>
            <li>Detect abuse or security anomalies that could impact visitors.</li>
          </ol>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>Use of cookies and third parties</h2>
          <p className="muted" style={{ margin: 0 }}>
            Cookies help us remember your preferences and track coupon success. We also partner with providers such as Google Analytics and affiliate
            networks to measure engagement. These partners may set their own cookies subject to their policies.
          </p>
          <p className="muted" style={{ margin: 0 }}>
            You can disable cookies in your browser settings or opt out of personalized advertising via the Network Advertising Initiative. Doing so may
            impact certain features, but Coursespeak will remain accessible.
          </p>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>Your rights and choices</h2>
          <ul style={{ margin: 0, paddingLeft: 20, color: "#cbd5f5", display: "grid", gap: 8 }}>
            <li>Request a copy of the personal data we hold about you.</li>
            <li>Correct inaccuracies or delete your newsletter subscription at any time.</li>
            <li>Withdraw consent for marketing communications with a single click at the bottom of any email.</li>
          </ul>
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>Contact us</h2>
          <p className="muted" style={{ margin: 0 }}>
            Questions about privacy or data control? Email us at <a href="mailto:privacy@coursespeak.com" className="footer-link">privacy@coursespeak.com</a> and we&apos;ll respond within three business days.
          </p>
        </div>
      </section>
    </div>
  );
}
