import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: "Redirecting… | Coursespeak",
    robots: { index: false, follow: true },
  };
}

export default async function LegacyPostRedirect({ params }: Props) {
  const { slug } = await params;
  const specials: Record<string, string> = {
    "contact-us": "/contact",
    blog: "/deal/blog",
  };

  const target = specials[slug] || `/deal/${slug}`;
  permanentRedirect(target);
}
