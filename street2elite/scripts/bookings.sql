create table public.bookings (
  id uuid not null default gen_random_uuid (),
  session_id uuid not null,
  child_id uuid not null,
  parent_id uuid not null,
  status text null default 'pending'::text,
  payment_status text null default 'pending'::text,
  payment_intent_id text null,
  checked_in boolean null default false,
  checked_in_at timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint bookings_pkey primary key (id),
  constraint bookings_session_id_child_id_key unique (session_id, child_id),
  constraint bookings_parent_id_fkey foreign KEY (parent_id) references profiles (id) on delete CASCADE,
  constraint bookings_child_id_fkey foreign KEY (child_id) references children (id) on delete CASCADE,
  constraint bookings_session_id_fkey foreign KEY (session_id) references sessions (id) on delete CASCADE,
  constraint bookings_payment_status_check check (
    (
      payment_status = any (
        array['pending'::text, 'paid'::text, 'refunded'::text]
      )
    )
  ),
  constraint bookings_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'confirmed'::text,
          'cancelled'::text,
          'completed'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;