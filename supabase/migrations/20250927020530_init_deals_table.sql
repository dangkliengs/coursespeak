create table if not exists public.deals (
  id text primary key,
  slug text,
  title text not null,
  provider text not null,
  price numeric,
  "originalPrice" numeric,
  rating real,
  students integer,
  coupon text,
  url text not null,
  category text,
  subcategory text,
  "expiresAt" timestamptz,
  image text,
  description text,
  content text,
  faqs jsonb,
  subtitle text,
  learn jsonb,
  requirements jsonb,
  curriculum jsonb,
  instructor text,
  duration text,
  language text,
  "createdAt" timestamptz not null default timezone('utc', now()),
  "updatedAt" timestamptz not null default timezone('utc', now()),
  "seoTitle" text,
  "seoDescription" text,
  "seoOgImage" text,
  "seoCanonical" text,
  "seoNoindex" boolean not null default false,
  "seoNofollow" boolean not null default false
);

create index if not exists deals_slug_idx on public.deals (slug);
create index if not exists deals_category_idx on public.deals (category);
create index if not exists deals_provider_idx on public.deals (provider);
create index if not exists deals_updated_at_idx on public.deals ("updatedAt");

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists deals_set_updated_at on public.deals;

create trigger deals_set_updated_at
before update on public.deals
for each row
execute function public.handle_updated_at();

alter table public.deals enable row level security;

create policy if not exists "Allow anonymous read deals"
on public.deals
for select
using (true);

create policy if not exists "Allow service role full access"
on public.deals
for all
to service_role
using (true)
with check (true);
