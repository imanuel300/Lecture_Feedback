-- יצירת הטבלה
create table public.feedback (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  satisfaction text not null,
  understanding text not null,
  improvement text not null
);

-- הפעלת RLS
alter table public.feedback enable row level security;

-- מחיקת policies קיימות אם יש
drop policy if exists "Enable insert for anonymous users" on public.feedback;
drop policy if exists "Enable read access for all users" on public.feedback;

-- יצירת policies חדשות
create policy "Enable insert for everyone" 
on public.feedback for insert 
to public 
with check (true);

create policy "Enable select for everyone" 
on public.feedback for select 
to public 
using (true);

-- הרשאות ברמת הטבלה
grant usage on schema public to public;
grant all on public.feedback to public;
grant all on public.feedback to anon;
grant all on public.feedback to authenticated;