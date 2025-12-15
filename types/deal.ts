export interface Deal {
  id: string;
  slug?: string; // optional human-friendly URL segment
  title: string;
  provider: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  students?: number;
  coupon?: string | null;
  url: string;
  category?: string;
  subcategory?: string;
  expiresAt?: string;
  image?: string;
  description?: string;
  content?: string; // rich text (markdown/plain) for article body
  faqs?: { q: string; a: string }[];
  learn?: string[]; // what you'll learn bullet points
  requirements?: string[]; // prerequisites
  curriculum?: { section: string; lectures: { title: string; duration?: string }[] }[]; // course content
  instructor?: string; // created by
  duration?: string;   // e.g., "12h 30m"
  language?: string;   // e.g., "English"
  createdAt?: string;  // ISO timestamp
  updatedAt?: string;  // ISO timestamp
  seoTitle?: string;
  seoDescription?: string;
  seoOgImage?: string;
  seoCanonical?: string;
  seoNoindex?: boolean;
  seoNofollow?: boolean;
}
