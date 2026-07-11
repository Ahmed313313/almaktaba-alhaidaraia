import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// يستخدم Service Key إن وُجد، وإلا Anon Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BUCKET = 'book-covers';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'covers';

    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم إرسال ملف' }, { status: 400 });
    }

    // تنظيف اسم الملف (لا نستخدم اسم الملف الأصلي لأنه قد يحتوي عربي)
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const safeName = `${folder}/${Date.now()}.${ext}`;

    // نحوّل لـ Blob بدون اسم حتى نتجنب مشكلة الأحرف العربية في headers
    const arrayBuffer = await file.arrayBuffer();
    const cleanBlob = new Blob([arrayBuffer], { type: file.type || 'image/jpeg' });

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(safeName, cleanBlob, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '31536000',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(data.path);

    return NextResponse.json({ success: true, url: urlData.publicUrl });
  } catch (e) {
    console.error('Upload exception:', e.message);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
