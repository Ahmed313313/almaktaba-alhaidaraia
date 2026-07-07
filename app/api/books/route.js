import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Vercel uses read-only filesystem, so we use /tmp for writes
// On local dev, we use the data directory
const IS_VERCEL = process.env.VERCEL === '1';
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');

// Default demo books data - all 12 books
const DEFAULT_BOOKS = [
  {
    id: '1', title: 'نهج البلاغة', slug: 'nahj-al-balagha', author: 'الشريف الرضي',
    publisher: 'دار المعرفة', category: 'كتب دينية وإسلامية', price: 25000, stock: 15,
    description: 'كتاب نهج البلاغة هو مجموعة من خطب ورسائل وحكم الإمام علي بن أبي طالب عليه السلام، جمعها الشريف الرضي في القرن الرابع الهجري.',
    cover_url: '', images: [], created_at: '2026-01-15'
  },
  {
    id: '2', title: 'الأربعون حديثاً', slug: 'al-arbaoon-hadith', author: 'الإمام الخميني',
    publisher: 'مؤسسة تنظيم ونشر آثار الإمام الخميني', category: 'كتب دينية وإسلامية', price: 18000, stock: 8,
    description: 'شرح أربعين حديثاً من أحاديث أهل البيت عليهم السلام مع تفسير عرفاني وأخلاقي عميق.',
    cover_url: '', images: [], created_at: '2026-02-10'
  },
  {
    id: '3', title: 'البؤساء', slug: 'les-miserables', author: 'فيكتور هوغو',
    publisher: 'دار التنوير', category: 'روايات عالمية مترجمة', price: 32000, stock: 5,
    description: 'رواية البؤساء هي إحدى أشهر روايات القرن التاسع عشر، تروي قصة جان فالجان وكفاحه في سبيل العدالة والحرية في فرنسا.',
    cover_url: '', images: [], created_at: '2026-03-05'
  },
  {
    id: '4', title: 'مقدمة ابن خلدون', slug: 'muqaddimah', author: 'ابن خلدون',
    publisher: 'دار الكتب العلمية', category: 'فكر وفلسفة', price: 28000, stock: 12,
    description: 'المقدمة هي كتاب ألفه ابن خلدون سنة 1377م كمقدمة لمؤلفه الضخم. تعتبر من أهم المؤلفات في فلسفة التاريخ وعلم الاجتماع.',
    cover_url: '', images: [], created_at: '2026-01-20'
  },
  {
    id: '5', title: 'ألف ليلة وليلة', slug: 'alf-layla', author: 'مجهول',
    publisher: 'دار صادر', category: 'أدب وشعر', price: 35000, stock: 3,
    description: 'مجموعة من القصص الشعبية التي جُمعت على مدى قرون من مصادر هندية وفارسية وعربية.',
    cover_url: '', images: [], created_at: '2026-02-28'
  },
  {
    id: '6', title: 'الأمير الصغير', slug: 'the-little-prince', author: 'أنطوان دو سانت إكزوبيري',
    publisher: 'دار المعارف', category: 'روايات عالمية مترجمة', price: 15000, stock: 20,
    description: 'رواية شاعرية فلسفية تروي قصة طيار يلتقي بأمير صغير في الصحراء.',
    cover_url: '', images: [], created_at: '2026-03-12'
  },
  {
    id: '7', title: 'قواعد العشق الأربعون', slug: 'rules-of-love', author: 'إليف شافاق',
    publisher: 'دار طوى', category: 'روايات عالمية مترجمة', price: 22000, stock: 0,
    description: 'رواية تدور حول العلاقة الروحية بين جلال الدين الرومي وشمس التبريزي.',
    cover_url: '', images: [], created_at: '2026-04-01'
  },
  {
    id: '8', title: 'فن الحرب', slug: 'art-of-war', author: 'سون تزو',
    publisher: 'مكتبة جرير', category: 'فكر وفلسفة', price: 14000, stock: 18,
    description: 'أقدم كتاب عسكري في العالم، كتبه الاستراتيجي الصيني سون تزو قبل 2500 عام.',
    cover_url: '', images: [], created_at: '2026-04-15'
  },
  {
    id: '9', title: 'العادات الذرية', slug: 'atomic-habits', author: 'جيمس كلير',
    publisher: 'دار التنوير', category: 'تطوير الذات', price: 20000, stock: 25,
    description: 'كتاب يقدم إطاراً عملياً لبناء عادات جيدة والتخلص من العادات السيئة.',
    cover_url: '', images: [], created_at: '2026-05-01'
  },
  {
    id: '10', title: 'تاريخ الطبري', slug: 'tarikh-tabari', author: 'ابن جرير الطبري',
    publisher: 'دار الكتب العلمية', category: 'تاريخ إسلامي وعام', price: 45000, stock: 6,
    description: 'أحد أهم كتب التاريخ الإسلامي، يغطي تاريخ العالم من بدء الخليقة إلى عصر المؤلف.',
    cover_url: '', images: [], created_at: '2026-05-20'
  },
  {
    id: '11', title: 'الطفل في الإسلام', slug: 'child-in-islam', author: 'محمد الريشهري',
    publisher: 'دار الحديث', category: 'كتب الأطفال وتربيتهم', price: 16000, stock: 10,
    description: 'كتاب شامل عن حقوق الطفل وتربيته في الإسلام مع أحاديث ومرويات أهل البيت عليهم السلام.',
    cover_url: '', images: [], created_at: '2026-06-01'
  },
  {
    id: '12', title: 'سيرة الإمام علي', slug: 'imam-ali-biography', author: 'باقر شريف القرشي',
    publisher: 'دار التعارف', category: 'سير ذاتية', price: 30000, stock: 7,
    description: 'سيرة شاملة ومفصلة عن حياة الإمام علي بن أبي طالب عليه السلام من الولادة حتى الشهادة.',
    cover_url: '', images: [], created_at: '2026-06-15'
  },
];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(BOOKS_FILE)) {
    fs.writeFileSync(BOOKS_FILE, JSON.stringify(DEFAULT_BOOKS, null, 2), 'utf-8');
  }
}

function readBooks() {
  ensureDataDir();
  try {
    const data = fs.readFileSync(BOOKS_FILE, 'utf-8');
    const books = JSON.parse(data);
    // Ensure each book has images array
    return books.map(b => ({ ...b, images: b.images || [] }));
  } catch {
    return DEFAULT_BOOKS;
  }
}

function writeBooks(books) {
  ensureDataDir();
  fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2), 'utf-8');
}

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
    const books = readBooks();
    return NextResponse.json({ success: true, books });
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
      return NextResponse.json({ success: false, error: 'يجب ملء الحقول المطلوبة (العنوان، المؤلف، التصنيف، السعر)' }, { status: 400 });
    }

    const books = readBooks();
    const newBook = {
      id: Date.now().toString(),
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
      created_at: new Date().toISOString().split('T')[0],
    };

    books.unshift(newBook);
    writeBooks(books);

    return NextResponse.json({ success: true, book: newBook });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - تعديل كتاب
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const books = readBooks();
    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'الكتاب غير موجود' }, { status: 404 });
    }

    // Update fields
    if (updates.title) {
      books[index].title = updates.title.trim();
      books[index].slug = generateSlug(updates.title);
    }
    if (updates.author) books[index].author = updates.author.trim();
    if (updates.publisher !== undefined) books[index].publisher = updates.publisher.trim();
    if (updates.category) books[index].category = updates.category;
    if (updates.price !== undefined) books[index].price = Number(updates.price);
    if (updates.stock !== undefined) books[index].stock = Number(updates.stock);
    if (updates.description !== undefined) books[index].description = updates.description.trim();
    if (updates.cover_url !== undefined) books[index].cover_url = updates.cover_url;
    if (updates.images !== undefined) {
      books[index].images = Array.isArray(updates.images) ? updates.images.filter(img => img && img.trim() !== '') : [];
    }

    writeBooks(books);

    return NextResponse.json({ success: true, book: books[index] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - حذف كتاب
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الكتاب مطلوب' }, { status: 400 });
    }

    const books = readBooks();
    const filtered = books.filter(b => b.id !== id);

    if (filtered.length === books.length) {
      return NextResponse.json({ success: false, error: 'الكتاب غير موجود' }, { status: 404 });
    }

    writeBooks(filtered);

    return NextResponse.json({ success: true, message: 'تم حذف الكتاب بنجاح' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
