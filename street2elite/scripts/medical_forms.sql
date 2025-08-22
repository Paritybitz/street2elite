create table public.medical_forms (
  id uuid not null default gen_random_uuid (),
  child_id uuid not null,
  file_url text not null,
  valid_from timestamp with time zone not null,
  valid_to timestamp with time zone not null,
  status text null default 'pending'::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint medical_forms_pkey primary key (id),
  constraint medical_forms_child_id_fkey foreign KEY (child_id) references children (id) on delete CASCADE,
  constraint medical_forms_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'approved'::text,
          'expired'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;