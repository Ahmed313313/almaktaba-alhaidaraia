import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET - جلب قائمة الرغبات (للأدمن) مُجمَّعة حسب الكتاب
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    // تجميع حسب الكتاب
    const grouped = {};
    for (const item of data || []) {
      if (!grouped[item.book_id]) {
        grouped[item.book_id] = { bookId: item.book_id, bookTitle: item.book_title, count: 0 };
      }
      grouped[item.book_id].count++;
    }
    const summary = Object.values(grouped).sort((a, b) => b.count - a.count);
    return NextResponse.json({ success: true, wishlist: summary, total: (data || []).length });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - إضافة كتاب لقائمة الرغبات
export async function POST(request) {
  try {
    const { bookId, bookTitle } = await request.json();
    if (!bookId || !bookTitle)
      return NextResponse.json({ success: false, error: 'بيانات ناقصة' }, { status: 400 });

    const { error } = await supabase.from('wishlist').insert([{ book_id: bookId, book_title: bookTitle }]);
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'تمت الإضافة لقائمة الرغبات' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
