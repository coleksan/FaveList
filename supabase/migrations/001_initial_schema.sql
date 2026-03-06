-- ============================================
-- Taste Lists MVP - Initial Database Schema
-- ============================================

-- ==================
-- TABLES
-- ==================

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- Lists
create table lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text not null check (category in ('movies', 'tv', 'music')),
  cover_image_url text,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- List Items
create table list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references lists(id) on delete cascade not null,
  rank integer not null,
  title text not null,
  subtitle text,
  image_url text,
  external_id text,
  metadata jsonb default '{}',
  note text,
  created_at timestamptz default now()
);

-- Likes
create table likes (
  user_id uuid references profiles(id) on delete cascade,
  list_id uuid references lists(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, list_id)
);

-- Follows
create table follows (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

-- ==================
-- INDEXES
-- ==================

create index idx_lists_user_id on lists(user_id);
create index idx_lists_category on lists(category);
create index idx_lists_created_at on lists(created_at desc);
create index idx_list_items_list_id on list_items(list_id);
create unique index idx_list_items_list_rank on list_items(list_id, rank);

-- ==================
-- VIEWS
-- ==================

create view list_with_stats as
select
  l.*,
  p.username,
  p.display_name,
  p.avatar_url,
  count(distinct li.id) as item_count,
  count(distinct lk.user_id) as like_count
from lists l
join profiles p on l.user_id = p.id
left join list_items li on l.id = li.list_id
left join likes lk on l.id = lk.list_id
group by l.id, p.username, p.display_name, p.avatar_url;

-- ==================
-- TRIGGERS
-- ==================

-- Auto-create profile when a new user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    lower(replace(coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), ' ', '')),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-update updated_at on lists
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_list_updated
  before update on lists
  for each row execute function update_updated_at();

-- ==================
-- ROW LEVEL SECURITY
-- ==================

alter table profiles enable row level security;
alter table lists enable row level security;
alter table list_items enable row level security;
alter table likes enable row level security;
alter table follows enable row level security;

-- Profiles: anyone can read, owners can update
create policy "Profiles are publicly readable"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Lists: public lists readable by anyone, owners can CRUD
create policy "Public lists are readable"
  on lists for select using (is_public = true or auth.uid() = user_id);

create policy "Users can create own lists"
  on lists for insert with check (auth.uid() = user_id);

create policy "Users can update own lists"
  on lists for update using (auth.uid() = user_id);

create policy "Users can delete own lists"
  on lists for delete using (auth.uid() = user_id);

-- List items: follow parent list visibility
create policy "List items are readable if list is accessible"
  on list_items for select using (
    exists (
      select 1 from lists
      where lists.id = list_items.list_id
      and (lists.is_public = true or lists.user_id = auth.uid())
    )
  );

create policy "Users can manage items in own lists"
  on list_items for insert with check (
    exists (
      select 1 from lists
      where lists.id = list_items.list_id
      and lists.user_id = auth.uid()
    )
  );

create policy "Users can update items in own lists"
  on list_items for update using (
    exists (
      select 1 from lists
      where lists.id = list_items.list_id
      and lists.user_id = auth.uid()
    )
  );

create policy "Users can delete items in own lists"
  on list_items for delete using (
    exists (
      select 1 from lists
      where lists.id = list_items.list_id
      and lists.user_id = auth.uid()
    )
  );

-- Likes: anyone can read, authenticated users can manage own
create policy "Likes are publicly readable"
  on likes for select using (true);

create policy "Users can like lists"
  on likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike lists"
  on likes for delete using (auth.uid() = user_id);

-- Follows: anyone can read, authenticated users can manage own
create policy "Follows are publicly readable"
  on follows for select using (true);

create policy "Users can follow others"
  on follows for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow others"
  on follows for delete using (auth.uid() = follower_id);
