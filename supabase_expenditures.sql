create extension if not exists pgcrypto;

create table if not exists public.expenditures (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  description text not null,
  amount numeric not null,
  date text not null,
  created_at timestamp with time zone default now()
);

alter table public.expenditures enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'expenditures' and policyname = 'expenditures_select_public'
  ) then
    create policy expenditures_select_public on public.expenditures for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'expenditures' and policyname = 'expenditures_insert_admin'
  ) then
    create policy expenditures_insert_admin on public.expenditures for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'expenditures' and policyname = 'expenditures_delete_admin'
  ) then
    create policy expenditures_delete_admin on public.expenditures for delete using (true);
  end if;
end $$;
