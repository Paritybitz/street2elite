create table public.children (
  id uuid not null default gen_random_uuid (),
  parent_id uuid not null,
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  skill_level text null default 'beginner'::text,
  medical_notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  photo_url text null,
  approval_status text null default 'pending'::text,
  approved_at timestamp with time zone null,
  approved_by uuid null,
  rejection_reason text null,
  constraint children_pkey primary key (id),
  constraint children_approved_by_fkey foreign KEY (approved_by) references profiles (id),
  constraint children_parent_id_fkey foreign KEY (parent_id) references profiles (id) on delete CASCADE,
  constraint children_approval_status_check check (
    (
      approval_status = any (
        array[
          'pending'::text,
          'approved'::text,
          'rejected'::text
        ]
      )
    )
  ),
  constraint children_skill_level_check check (
    (
      skill_level = any (
        array[
          'beginner'::text,
          'intermediate'::text,
          'advanced'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;