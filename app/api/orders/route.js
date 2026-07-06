import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// أسعار التوصيل
const DELIVERY_PRICES = {
  'البصرة': 3000,
  'default': 5000, // باقي المحافظات
};

function getDeliveryPrice(province) {
  return DELIVERY_PRICES[province] || DELIVERY_PRICES['default'];
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readOrders() {
  ensureDataDir();
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
}

// توليد رقم طلب يبدأ من 100
function generateOrderNumber(orders) {
  if (orders.length === 0) return 100;
  const maxNum = Math.max(...orders.map(o => o.orderNumber || 99));
  return Math.max(maxNum + 1, 100);
}

// GET - جلب الطلبات (للإدارة أو للمستخدم بحسب رقم الهاتف)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    const orders = readOrders();

    // إذا تم تمرير رقم هاتف، أرجع فقط طلبات هذا المستخدم
    if (phone) {
      const userOrders = orders.filter(o => o.phone === phone);
      return NextResponse.json({ success: true, orders: userOrders });
    }

    // بدون هاتف = طلب من الأدمن = كل الطلبات
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - إنشاء طلب جديد
export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, phone, province, address, notes, items, total } = body;

    // Validation
    if (!customerName || !phone || !province || !address || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'جميع الحقول المطلوبة يجب ملؤها' },
        { status: 400 }
      );
    }

    const orders = readOrders();
    const orderNumber = generateOrderNumber(orders);
    const deliveryPrice = getDeliveryPrice(province);
    const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const grandTotal = itemsTotal + deliveryPrice;

    const order = {
      id: Date.now().toString(),
      orderNumber,
      customerName,
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
      itemsTotal,
      deliveryPrice,
      total: grandTotal,
      status: 'جديد',
      createdAt: new Date().toISOString(),
    };

    orders.unshift(order); // أضف بالأول
    writeOrders(orders);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH - تحديث حالة طلب
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const orders = readOrders();
    const index = orders.findIndex(o => o.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 });
    }

    orders[index].status = status;
    writeOrders(orders);

    return NextResponse.json({ success: true, order: orders[index] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
