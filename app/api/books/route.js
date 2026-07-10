import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function generateSlug(title) {
  return title
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '')
    .substring(0, 80);
}

// GET - جلب كل الكتب
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, books: data || [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - إضافة كتاب جديد
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, author, publisher, category, price, stock, description, cover_url, images } = body;

    if (!title || !author || !category || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'يجب ملء الحقول المطلوبة (العنوان، المؤلف، التصنيف، السعر)' },
        { status: 400 }
      );
    }

    const newBook = {
      title: title.trim(),
      slug: generateSlug(title),
      author: author.trim(),
      publisher: publisher?.trim() || '',
      category,
      price: Number(price),
      stock: Number(stock) || 0,
      description: description?.trim() || '',
      cover_url: cover_url || '',
      images: Array.isArray(images) ? images.filter(img => img && img.trim() !== '') : [],
    };

    const { data, error } = await supabase
      .from('books')
      .insert([newBook])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, book: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - تعديل كتاب
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, author, publisher, category, price, stock, description, cover_url, images } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الكتاب مطلوب' }, { status: 400 });
    }

    const updates = {};
    if (title) { updates.title = title.trim(); updates.slug = generateSlug(title); }
    if (author) updates.author = author.trim();
    if (publisher !== undefined) updates.publisher = publisher.trim();
    if (category) updates.category = category;
    if (price !== undefined) updates.price = Number(price);
    if (stock !== undefined) updates.stock = Number(stock);
    if (description !== undefined) updates.description = description.trim();
    if (cover_url !== undefined) updates.cover_url = cover_url;
    if (images !== undefined) {
      updates.images = Array.isArray(images) ? images.filter(img => img && img.trim() !== '') : [];
    }

    const { data, error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, book: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH - تعديل تصنيف مجموعة كتب (Bulk)
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { ids, category } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'معرفات الكتب مطلوبة' }, { status: 400 });
    }

    const { error } = await supabase
      .from('books')
      .update({ category })
      .in('id', ids);

    if (error) throw error;
    return NextResponse.json({ success: true, message: `تم تحديث ${ids.length} كتاب` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - حذف كتاب أو مجموعة كتب
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ids = searchParams.get('ids'); // حذف جماعي: ids=1,2,3

    if (ids) {
      const idArray = ids.split(',').map(i => i.trim()).filter(Boolean);
      const { error } = await supabase
        .from('books')
        .delete()
        .in('id', idArray);
      if (error) throw error;
      return NextResponse.json({ success: true, message: `تم حذف ${idArray.length} كتاب` });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الكتاب مطلوب' }, { status: 400 });
    }

    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: 'تم حذف الكتاب بنجاح' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
