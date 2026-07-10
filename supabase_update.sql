-- أضف حقل الملصق وعداد الشراء للكتب
ALTER TABLE books ADD COLUMN IF NOT EXISTS label TEXT DEFAULT '';
ALTER TABLE books ADD COLUMN IF NOT EXISTS purchase_count INTEGER DEFAULT 0;

-- جدول التقييمات (Supabase)
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  book_id TEXT NOT NULL,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);

-- جدول قائمة الرغبات
CREATE TABLE IF NOT EXISTS wishlist (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  book_id TEXT NOT NULL,
  book_title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on wishlist" ON wishlist FOR ALL USING (true) WITH CHECK (true);
