create table public.profiles (
  id uuid not null,
  first_name text not null,
  last_name text not null,
  phone text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  role text null default 'parent'::text,
  email text null,
  constraint profiles_pkey primary key (id),
  constraint unique_email unique (email),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_role_check check (
    (
      role = any (
        array['parent'::text, 'admin'::text, 'coach'::text]
      )
    )
  )
) TABLESPACE pg_default;