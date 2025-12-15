import type { Metadata } from "next";
import { permanentRedirect, notFound } from "next/navigation";
import { readDeals } from "@/lib/store";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: "Redirecting… | Coursespeak",
    robots: { index: false, follow: true },
  };
}

export default async function LegacyRootRedirect({ params }: Props) {
  const { slug } = await params;
  const specials: Record<string, string> = {
    "contact-us": "/contact",
    blog: "/deal/blog",
  };

  // Check if it's a special redirect
  const specialTarget = specials[slug];
  if (specialTarget) {
    permanentRedirect(specialTarget);
  }

  // Try to find deal by slug and redirect to ID
  const deals = await readDeals();
  const deal = deals.find((d: any) => d.slug === slug);
  
  if (deal?.id) {
    permanentRedirect(`/deal/${deal.id}`);
  }

  // If no deal found, show 404
  notFound();
}
