-- Enable UUID extension if not already done
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  phone text,
  avatar text,
  role text default 'customer' check (role in ('customer', 'admin', 'receptionist')),
  gender text,
  dob date,
  address text,
  city text,
  state text,
  country text,
  pincode text,
  instagram text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- 2. Service Categories
create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image text,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.service_categories enable row level security;

-- 3. Services
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.service_categories on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image text,
  price numeric not null check (price >= 0),
  duration integer not null check (duration > 0), -- in minutes
  active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.services enable row level security;

-- 4. Bookings
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_number text not null unique,
  customer_id uuid references public.profiles on delete cascade not null,
  service_id uuid references public.services on delete restrict not null,
  date date not null,
  time time not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'done', 'no_show', 'rescheduled')),
  note text,
  admin_note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bookings enable row level security;

-- 5. Gallery Categories
create table if not exists public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.gallery_categories enable row level security;

-- 6. Gallery Items
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image text not null,
  category_id uuid references public.gallery_categories on delete set null,
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.gallery enable row level security;

-- 7. Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings on delete set null,
  customer_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  review text,
  image text,
  approved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;

-- 8. Contact Messages
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text not null,
  message text not null,
  status text default 'unread' check (status in ('unread', 'read', 'replied')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.contact_messages enable row level security;

-- 9. Admins
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null unique,
  permissions text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admins enable row level security;

-- 10. Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null,
  user_id uuid references public.profiles on delete cascade,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

-- 11. Activity Logs
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete set null,
  action text not null,
  ip text,
  browser text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.activity_logs enable row level security;

-- 12. Settings
create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);

alter table public.settings enable row level security;

-- 13. Time Slots
create table if not exists public.time_slots (
  id uuid primary key default gen_random_uuid(),
  time time not null unique,
  active boolean default true
);

alter table public.time_slots enable row level security;

-- 14. Business Hours
create table if not exists public.business_hours (
  id uuid primary key default gen_random_uuid(),
  day_of_week integer not null check (day_of_week >= 0 and day_of_week <= 6) unique, -- 0 = Sunday, 6 = Saturday
  open_time time,
  close_time time,
  is_closed boolean default false
);

alter table public.business_hours enable row level security;

-- 15. Holidays
create table if not exists public.holidays (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  description text
);

alter table public.holidays enable row level security;

-- 16. Banners
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  image text not null,
  link text,
  sort_order integer default 0,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.banners enable row level security;

-- 17. FAQ
create table if not exists public.faq (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer default 0,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.faq enable row level security;

-- Setup triggers and helper functions
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_bookings_updated_at before update on public.bookings
  for each row execute procedure public.update_updated_at_column();


-- Helper function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Helper function to check if user is receptionist or admin
create or replace function public.is_staff()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'receptionist')
  );
end;
$$ language plpgsql security definer;


-- RLS Policies

-- profiles
create policy "Allow owners and admins to select profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "Allow owners and admins to update profile" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

create policy "Allow owners to insert profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Allow admins to delete profile" on public.profiles
  for delete using (public.is_admin());

-- service_categories
create policy "Allow public read access to service categories" on public.service_categories
  for select using (true);

create policy "Allow admins to insert service categories" on public.service_categories
  for insert with check (public.is_admin());

create policy "Allow admins to update service categories" on public.service_categories
  for update using (public.is_admin());

create policy "Allow admins to delete service categories" on public.service_categories
  for delete using (public.is_admin());

-- services
create policy "Allow public read access to services" on public.services
  for select using (true);

create policy "Allow admins to insert services" on public.services
  for insert with check (public.is_admin());

create policy "Allow admins to update services" on public.services
  for update using (public.is_admin());

create policy "Allow admins to delete services" on public.services
  for delete using (public.is_admin());

-- bookings
create policy "Allow customers and staff to select bookings" on public.bookings
  for select using (auth.uid() = customer_id or public.is_staff());

create policy "Allow customers and staff to insert bookings" on public.bookings
  for insert with check (auth.uid() = customer_id or public.is_staff());

create policy "Allow customers and staff to update bookings" on public.bookings
  for update using (auth.uid() = customer_id or public.is_staff());

create policy "Allow admins to delete bookings" on public.bookings
  for delete using (public.is_admin());

-- gallery_categories
create policy "Allow public read access to gallery categories" on public.gallery_categories
  for select using (true);

create policy "Allow admins to manage gallery categories" on public.gallery_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- gallery
create policy "Allow public read access to gallery" on public.gallery
  for select using (true);

create policy "Allow admins to manage gallery" on public.gallery
  for all using (public.is_admin()) with check (public.is_admin());

-- reviews
create policy "Allow public read access to approved reviews" on public.reviews
  for select using (approved = true or public.is_admin());

create policy "Allow authenticated users to insert reviews" on public.reviews
  for insert with check (auth.uid() is not null);

create policy "Allow admins to manage reviews" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- contact_messages
create policy "Allow public to insert contact messages" on public.contact_messages
  for insert with check (true);

create policy "Allow staff to select contact messages" on public.contact_messages
  for select using (public.is_staff());

create policy "Allow staff to update contact messages" on public.contact_messages
  for update using (public.is_staff());

create policy "Allow admins to delete contact messages" on public.contact_messages
  for delete using (public.is_admin());

-- admins
create policy "Allow admins to manage admins" on public.admins
  for all using (public.is_admin()) with check (public.is_admin());

-- notifications
create policy "Allow owners and admins to select notifications" on public.notifications
  for select using (auth.uid() = user_id or public.is_admin());

create policy "Allow owners and admins to update notifications" on public.notifications
  for update using (auth.uid() = user_id or public.is_admin());

create policy "Allow admins to insert notifications" on public.notifications
  for insert with check (public.is_admin());

create policy "Allow admins to delete notifications" on public.notifications
  for delete using (public.is_admin());

-- activity_logs
create policy "Allow admins to select activity logs" on public.activity_logs
  for select using (public.is_admin());

create policy "Allow authenticated users to insert activity logs" on public.activity_logs
  for insert with check (auth.uid() is not null);

-- settings
create policy "Allow public read access to settings" on public.settings
  for select using (true);

create policy "Allow admins to manage settings" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

-- time_slots
create policy "Allow public read access to time slots" on public.time_slots
  for select using (true);

create policy "Allow admins to manage time slots" on public.time_slots
  for all using (public.is_admin()) with check (public.is_admin());

-- business_hours
create policy "Allow public read access to business hours" on public.business_hours
  for select using (true);

create policy "Allow admins to manage business hours" on public.business_hours
  for all using (public.is_admin()) with check (public.is_admin());

-- holidays
create policy "Allow public read access to holidays" on public.holidays
  for select using (true);

create policy "Allow admins to manage holidays" on public.holidays
  for all using (public.is_admin()) with check (public.is_admin());

-- banners
create policy "Allow public read access to banners" on public.banners
  for select using (true);

create policy "Allow admins to manage banners" on public.banners
  for all using (public.is_admin()) with check (public.is_admin());

-- faq
create policy "Allow public read access to faq" on public.faq
  for select using (true);

create policy "Allow admins to manage faq" on public.faq
  for all using (public.is_admin()) with check (public.is_admin());


-- Profiles auto-creation trigger on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, avatar, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'customer'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Remove the trigger if it exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Storage bucket setup
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('gallery', 'gallery', true),
  ('services', 'services', true),
  ('banners', 'banners', true),
  ('logos', 'logos', true),
  ('documents', 'documents', false)
on conflict (id) do nothing;

-- Storage object policies
drop policy if exists "Public Access to Avatars" on storage.objects;
drop policy if exists "Public Access to Gallery" on storage.objects;
drop policy if exists "Public Access to Services" on storage.objects;
drop policy if exists "Public Access to Banners" on storage.objects;
drop policy if exists "Public Access to Logos" on storage.objects;
drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Admins have full control over storage" on storage.objects;

create policy "Public Access to Avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Public Access to Gallery" on storage.objects for select using (bucket_id = 'gallery');
create policy "Public Access to Services" on storage.objects for select using (bucket_id = 'services');
create policy "Public Access to Banners" on storage.objects for select using (bucket_id = 'banners');
create policy "Public Access to Logos" on storage.objects for select using (bucket_id = 'logos');

create policy "Users can upload their own avatar" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Admins have full control over storage" on storage.objects for all
  using (public.is_admin())
  with check (public.is_admin());
