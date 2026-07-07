import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const IS_VERCEL = process.env.VERCEL === '1';
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(REVIEWS_FILE)) fs.writeFileSync(REVIEWS_FILE, '[]', 'utf-8');
}

function readReviews() {
  ensureDataDir();
  try { return JSON.parse(fs.readFileSync(REVIEWS_FILE, 'utf-8')); }
  catch { return []; }
}

function writeReviews(reviews) {
  ensureDataDir();
  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
}

// GET - جلب التقييمات (لكتاب معين أو الكل)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const reviews = readReviews();

    if (bookId) {
      const bookReviews = reviews.filter(r => r.bookId === bookId);
      const avg = bookReviews.length > 0
        ? bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length
        : 0;
      return NextResponse.json({
        success: true,
        reviews: bookReviews,
        average: Math.round(avg * 10) / 10,
        count: bookReviews.length
      });
    }

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - إضافة تقييم جديد
export async function POST(request) {
  try {
    const body = await request.json();
    const { bookId, name, rating, comment } = body;

    if (!bookId || !name || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'بيانات غير صحيحة' }, { status: 400 });
    }

    const reviews = readReviews();
    const review = {
      id: Date.now().toString(),
      bookId,
      name: name.trim(),
      rating: Number(rating),
      comment: comment?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    reviews.unshift(review);
    writeReviews(reviews);

    return NextResponse.json({ success: true, review });
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

    const reviews = readReviews();
    const filtered = reviews.filter(r => r.id !== id);
    if (filtered.length === reviews.length) {
      return NextResponse.json({ success: false, error: 'التقييم غير موجود' }, { status: 404 });
    }
    writeReviews(filtered);
    return NextResponse.json({ success: true, message: 'تم حذف التقييم' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
