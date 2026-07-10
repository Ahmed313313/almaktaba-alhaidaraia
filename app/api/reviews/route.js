import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function mapReview(r) {
  return { ...r, bookId: r.book_id, createdAt: r.created_at };
}

// GET - جلب التقييمات
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (bookId) query = query.eq('book_id', bookId);

    const { data, error } = await query;
    if (error) throw error;

    const reviews = (data || []).map(mapReview);

    if (bookId) {
      const avg = reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
      return NextResponse.json({
        success: true, reviews,
        average: Math.round(avg * 10) / 10,
        count: reviews.length,
      });
    }
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - إضافة تقييم
export async function POST(request) {
  try {
    const { bookId, name, rating, comment } = await request.json();
    if (!bookId || !name || !rating || rating < 1 || rating > 5)
      return NextResponse.json({ success: false, error: 'بيانات غير صحيحة' }, { status: 400 });

    const { data, error } = await supabase.from('reviews').insert([{
      book_id: bookId, name: name.trim(),
      rating: Number(rating), comment: comment?.trim() || '',
    }]).select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, review: mapReview(data) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - حذف تقييم (للأدمن)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'معرف التقييم مطلوب' }, { status: 400 });

    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'تم حذف التقييم' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
