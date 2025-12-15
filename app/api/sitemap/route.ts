import { getServerSideSitemap, type ISitemapField } from 'next-sitemap';
import { readDeals } from '@/lib/store';

type SitemapField = Omit<ISitemapField, 'changefreq'> & {
  changefreq?: 'daily' | 'monthly' | 'always' | 'hourly' | 'weekly' | 'yearly' | 'never';
};

export async function GET() {
  // Fetch your deals
  const deals = await readDeals();
  
  // Format deals for sitemap
  const fields: SitemapField[] = deals.map((deal) => ({
    loc: `https://coursespeak.com/deal/${deal.slug || deal.id}`,
    lastmod: new Date(deal.updatedAt || deal.createdAt || new Date()).toISOString(),
    changefreq: 'daily',
    priority: 0.8,
  }));

  // Add static routes
  const staticRoutes: SitemapField[] = [
    { loc: 'https://coursespeak.com', changefreq: 'daily', priority: 1.0 },
    { loc: 'https://coursespeak.com/search', changefreq: 'daily', priority: 0.8 },
    { loc: 'https://coursespeak.com/categories', changefreq: 'daily', priority: 0.9 },
    { loc: 'https://coursespeak.com/udemy-coupons', changefreq: 'daily', priority: 0.8 },
  ];

  // Combine all routes
  const allRoutes: SitemapField[] = [...staticRoutes, ...fields];

  // Type assertion to handle the custom SitemapField type
  return getServerSideSitemap(allRoutes as ISitemapField[]);
}

export const dynamic = 'force-dynamic';
