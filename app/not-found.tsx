import Link from "next/link";
import NewsletterSignupWrapper from "@/components/NewsletterSignupWrapper";

const quickLinks = [
  { href: "/", label: "Return home" },
  { href: "/udemy-coupons", label: "Udemy coupons" },
  { href: "/categories", label: "Browse categories" },
  { href: "/search", label: "Search courses" },
];

const couponActions = [
  { href: "/?provider=udemy&freeOnly=1", label: "Free Udemy courses" },
  { href: "/?provider=udemy", label: "Latest Udemy deals" },
  { href: "/post/udemy-coupons-guide", label: "Udemy coupon guide" },
];

const popularTopics = [
  "Web Development",
  "Artificial Intelligence",
  "Business & Productivity",
  "Design & Creativity",
  "IT & Networking",
  "Marketing",
];

const supportLinks = [
  { href: "/contact", label: "Contact support" },
  { href: "mailto:hello@coursespeak.com", label: "Email Coursespeak" },
];

export default function NotFound() {
  return (
    <div style={{ display: "grid", gap: 32 }}>
      <section
        className="brand-border brand-gradient"
        style={{
          borderRadius: 20,
          padding: "40px 32px",
          display: "grid",
          gap: 18,
        }}
      >
        <span style={{ color: "var(--brand)", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>Page not found</span>
        <h1 style={{ margin: 0, fontSize: 34 }}>We can&apos;t find that page</h1>
        <p className="muted" style={{ margin: 0, maxWidth: 640 }}>
          The link you followed may be expired or the page might have moved. Jump back to the homepage or explore our most popular Udemy coupon collections.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/" className="btn" style={{ textDecoration: "none" }}>
            Back to homepage
          </Link>
          <Link href="/search" className="pill" style={{ textDecoration: "none", borderColor: "var(--brand-soft)" }}>
            Search deals
          </Link>
        </div>
      </section>

      <section style={{ display: "grid", gap: 20 }}>
        <h2 style={{ margin: 0 }}>Try these destinations</h2>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="card" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="card-body" style={{ gap: 10 }}>
                <div style={{ fontWeight: 600 }}>{link.label}</div>
                <span className="footer-link" style={{ padding: 0 }}>Visit →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="card brand-border" style={{ borderRadius: 16 }}>
        <div className="card-body" style={{ gap: 12 }}>
          <h2 style={{ margin: 0 }}>Find Udemy coupons faster</h2>
          <p className="muted" style={{ margin: 0 }}>
            Jump straight into verified 100% off coupons, newest Udemy deals, and our in-depth guide for redeeming discounts.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {couponActions.map((link) => (
              <Link key={link.href} href={link.href} className="pill" style={{ textDecoration: "none", borderColor: "var(--brand-soft)" }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 16 }}>
        <h2 style={{ margin: 0 }}>Popular topics</h2>
        <div className="card" style={{ borderRadius: 16 }}>
          <div className="card-body" style={{ gap: 8 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {popularTopics.map((topic) => (
                <Link
                  key={topic}
                  href={`/search?q=${encodeURIComponent(topic)}`}
                  className="pill"
                  style={{ textDecoration: "none", borderColor: "var(--brand-soft)" }}
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Need a hand?</h2>
        <div className="card" style={{ borderRadius: 16 }}>
          <div className="card-body" style={{ gap: 8 }}>
            <p className="muted" style={{ margin: 0 }}>Reach out or explore helpful resources for site-wide navigation.</p>
            <div style={{ display: "grid", gap: 8 }}>
              {supportLinks.map((link) => (
                <Link key={link.href} href={link.href} className="footer-link">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <NewsletterSignupWrapper />
      </section>
    </div>
  );
}
