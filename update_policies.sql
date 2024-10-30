-- מחיקת policies קיימות
drop policy if exists "Enable insert for anonymous users" on public.feedback;
drop policy if exists "Enable read access for all users" on public.feedback;
drop policy if exists "Enable insert for everyone" on public.feedback;
drop policy if exists "Enable select for everyone" on public.feedback;

-- הפעלת RLS מחדש
alter table public.feedback enable row level security;

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