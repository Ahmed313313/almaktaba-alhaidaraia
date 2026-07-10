import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// أسعار التوصيل
const DELIVERY_PRICES = {
  'البصرة': 3000,
  'default': 5000,
};

function getDeliveryPrice(province) {
  return DELIVERY_PRICES[province] || DELIVERY_PRICES['default'];
}

// تحويل من snake_case (Supabase) إلى camelCase (Frontend)
function mapOrder(o) {
  return {
    id: o.id,
    orderNumber: o.order_number,
    customerName: o.customer_name,
    phone: o.phone,
    province: o.province,
    address: o.address,
    notes: o.notes,
    items: o.items,
    itemsTotal: o.items_total,
    deliveryPrice: o.delivery_price,
    total: o.total,
    status: o.status,
    createdAt: o.created_at,
  };
}

// GET - جلب الطلبات
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (phone) {
      query = query.eq('phone', phone);
    }

    const { data, error } = await query;
    if (error) throw error;

    const orders = (data || []).map(mapOrder);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - إنشاء طلب جديد
export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, phone, province, address, notes, items } = body;

    if (!customerName || !phone || !province || !address || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'جميع الحقول المطلوبة يجب ملؤها' },
        { status: 400 }
      );
    }

    const deliveryPrice = getDeliveryPrice(province);
    const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = itemsTotal + deliveryPrice;

    const newOrder = {
      customer_name: customerName,
      phone,
      province,
      address,
      notes: notes || '',
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        author: item.author,
        price: item.price,
        quantity: item.quantity,
      })),
      items_total: itemsTotal,
      delivery_price: deliveryPrice,
      total,
      status: 'جديد',
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, order: mapOrder(data) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH - تحديث حالة طلب
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, order: mapOrder(data) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - حذف طلب
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الطلب مطلوب' }, { status: 400 });
    }

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: 'تم حذف الطلب بنجاح' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
