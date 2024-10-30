-- מחיקת טבלאות קיימות
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.lectures CASCADE;

-- יצירת טבלת הרצאות
CREATE TABLE public.lectures (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    title text NOT NULL,
    description text,
    code text UNIQUE NOT NULL,
    password text NOT NULL
);

-- יצירת טבלת משובים עם מידע נוסף
CREATE TABLE public.feedback (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    lecture_id uuid REFERENCES public.lectures(id) NOT NULL,
    satisfaction text NOT NULL,
    understanding text NOT NULL,
    improvement text NOT NULL,
    ip_address text,
    client_token text,
    browser_info text
);

-- אינדקסים לחיפוש מהיר
CREATE INDEX idx_feedback_lecture_id ON public.feedback(lecture_id);
CREATE INDEX idx_feedback_client_token ON public.feedback(client_token);
CREATE INDEX idx_feedback_ip_address ON public.feedback(ip_address);

-- הפעלת RLS
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- הרשאות גישה
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT ALL ON public.lectures TO anon;
GRANT ALL ON public.lectures TO authenticated;
GRANT ALL ON public.feedback TO anon;
GRANT ALL ON public.feedback TO authenticated;

-- פוליסיז להרצאות
CREATE POLICY "Enable select lectures for everyone" 
ON public.lectures FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Enable insert lectures for everyone" 
ON public.lectures FOR INSERT 
TO public 
WITH CHECK (true);

-- פוליסיז למשובים
CREATE POLICY "Enable insert feedback for everyone" 
ON public.feedback FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Enable select feedback for everyone" 
ON public.feedback FOR SELECT 
TO public 
USING (true); 