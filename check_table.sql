-- בדיקת מבנה הטבלה
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'feedback';

-- בדיקת תוכן הטבלה
SELECT * FROM feedback 
ORDER BY created_at DESC 
LIMIT 5; 