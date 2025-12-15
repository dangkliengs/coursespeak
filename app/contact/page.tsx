import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Contact | Coursespeak",
  description: "Send us a message with your questions, feedback, or partnership requests.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | Coursespeak",
    description: "Get in touch with the Coursespeak team.",
    url: "/contact",
    type: "website",
  },
};

type InputProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
};

function Field({ label, name, type = "text", required = false, placeholder }: InputProps) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #273044",
          background: "#101727",
          color: "#eaf4ff",
        }}
      />
    </label>
  );
}

function TextArea({ label, name, required = false, placeholder }: Omit<InputProps, "type">) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span>{label}</span>
      <textarea
        name={name}
        rows={6}
        required={required}
        placeholder={placeholder}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #273044",
          background: "#101727",
          color: "#eaf4ff",
          resize: "vertical",
          minHeight: 140,
        }}
      />
    </label>
  );
}

export default function ContactPage() {
  return (
    <section
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "32px 20px 56px",
        display: "grid",
        gap: 24,
      }}
    >
      <header style={{ display: "grid", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Contact Coursespeak</h1>
        <p className="muted" style={{ margin: 0 }}>
          Have questions, feedback, or partnership opportunities? Fill out the form below and we’ll get back to you within 1–2 business days.
        </p>
      </header>

      <div
        style={{
          borderRadius: 16,
          border: "1px solid #1f2330",
          background: "linear-gradient(145deg, #0f1320, #151b2c)",
          boxShadow: "0 16px 40px rgba(8, 13, 26, 0.35)",
          overflow: "hidden",
        }}
      >
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSctXPxQ9aXJa69FOJVgssa-V5niY1LeE_aDqVmbgukaysRKsQ/viewform?embedded=true"
          width="100%"
          height="820"
          style={{ border: 0 }}
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          title="Coursespeak Contact Form"
        >
          Loading…
        </iframe>
      </div>

      <aside style={{ display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Prefer direct contact?</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          <li>
            <a href="mailto:contact@coursespeak.com" style={{ color: "#3b82f6" }}>
              contact@coursespeak.com
            </a>
          </li>
          <li>
            <a href="https://x.com/courses_peak" target="_blank" rel="noreferrer" style={{ color: "#3b82f6" }}>
              Twitter / X
            </a>
          </li>
          <li>
            <a href="https://www.facebook.com/coursespeak24" target="_blank" rel="noreferrer" style={{ color: "#3b82f6" }}>
              Join our facebook community
            </a>
          </li>
        </ul>
      </aside>
    </section>
  );
}
