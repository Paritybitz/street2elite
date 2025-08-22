create table public.sessions (
  id uuid not null default gen_random_uuid (),
  title text not null,
  description text null,
  date date not null,
  start_time time without time zone not null,
  end_time time without time zone not null,
  max_participants integer not null default 20,
  skill_level text null default 'all'::text,
  price numeric(10, 2) not null,
  location text not null,
  coach_name text not null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint sessions_pkey primary key (id),
  constraint sessions_skill_level_check check (
    (
      skill_level = any (
        array[
          'beginner'::text,
          'intermediate'::text,
          'advanced'::text,
          'all'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;