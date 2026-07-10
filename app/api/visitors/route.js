import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET - عرض عداد الزوار (للأدمن)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;

    // تصفير عداد اليوم إذا تغير اليوم
    const today = new Date().toISOString().split('T')[0];
    if (data.last_reset !== today) {
      const { error: updateError } = await supabase
        .from('visitors')
        .update({ today: 0, last_reset: today })
        .eq('id', 1);
      if (!updateError) {
        return NextResponse.json({ success: true, total: data.total, today: 0 });
      }
    }

    return NextResponse.json({ success: true, total: data.total, today: data.today });
  } catch (error) {
    return NextResponse.json({ success: false, total: 0, today: 0, error: error.message });
  }
}

// POST - زيادة عداد الزوار (عند كل زيارة جديدة)
export async function POST() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // جلب البيانات الحالية
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;

    let newToday = data.today + 1;
    // تصفير إذا تغير اليوم
    if (data.last_reset !== today) {
      newToday = 1;
    }

    const { data: updated, error: updateError } = await supabase
      .from('visitors')
      .update({
        total: data.total + 1,
        today: newToday,
        last_reset: today,
      })
      .eq('id', 1)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      total: updated.total,
      today: updated.today,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
