create table if not exists public.kos (
  id text primary key,
  nama text not null,
  alamat text not null,
  harga integer not null,
  jenis text not null check (jenis in ('putra', 'putri', 'campur')),
  fasilitas text[] not null default '{}',
  kontak text,
  longitude double precision not null,
  latitude double precision not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.kos enable row level security;

drop policy if exists "public_select_kos" on public.kos;
drop policy if exists "public_insert_kos" on public.kos;
drop policy if exists "public_update_kos" on public.kos;
drop policy if exists "public_delete_kos" on public.kos;

create policy "public_select_kos"
on public.kos for select
to anon
using (true);

create policy "public_insert_kos"
on public.kos for insert
to anon
with check (true);

create policy "public_update_kos"
on public.kos for update
to anon
using (true)
with check (true);

create policy "public_delete_kos"
on public.kos for delete
to anon
using (true);
