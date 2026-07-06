import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client when credentials exist to avoid errors in demo mode
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Demo data for development when Supabase is not configured
export const DEMO_BOOKS = [
  {
    id: '1',
    title: 'نهج البلاغة',
    slug: 'nahj-al-balagha',
    author: 'الشريف الرضي',
    publisher: 'دار المعرفة',
    category: 'كتب دينية وإسلامية',
    price: 25000,
    stock: 15,
    description: 'كتاب نهج البلاغة هو مجموعة من خطب ورسائل وحكم الإمام علي بن أبي طالب عليه السلام، جمعها الشريف الرضي في القرن الرابع الهجري. يُعدّ من أهم المصادر الأدبية والفكرية في التراث الإسلامي.',
    cover_url: '/covers/nahj.jpg',
    created_at: '2026-01-15',
    images: []
  },
  {
    id: '2',
    title: 'الأربعون حديثاً',
    slug: 'al-arbaoon-hadith',
    author: 'الإمام الخميني',
    publisher: 'مؤسسة تنظيم ونشر آثار الإمام الخميني',
    category: 'كتب دينية وإسلامية',
    price: 18000,
    stock: 8,
    description: 'شرح أربعين حديثاً من أحاديث أهل البيت عليهم السلام مع تفسير عرفاني وأخلاقي عميق.',
    cover_url: '/covers/arbaoon.jpg',
    created_at: '2026-02-10',
    images: []
  },
  {
    id: '3',
    title: 'البؤساء',
    slug: 'les-miserables',
    author: 'فيكتور هوغو',
    publisher: 'دار التنوير',
    category: 'روايات عالمية مترجمة',
    price: 32000,
    stock: 5,
    description: 'رواية البؤساء هي إحدى أشهر روايات القرن التاسع عشر، تروي قصة جان فالجان وكفاحه في سبيل العدالة والحرية في فرنسا.',
    cover_url: '/covers/les-miserables.jpg',
    created_at: '2026-03-05',
    images: []
  },
  {
    id: '4',
    title: 'مقدمة ابن خلدون',
    slug: 'muqaddimah',
    author: 'ابن خلدون',
    publisher: 'دار الكتب العلمية',
    category: 'فكر وفلسفة',
    price: 28000,
    stock: 12,
    description: 'المقدمة هي كتاب ألفه ابن خلدون سنة 1377م كمقدمة لمؤلفه الضخم المسمى كتاب العبر. تعتبر من أهم المؤلفات في فلسفة التاريخ وعلم الاجتماع.',
    cover_url: '/covers/muqaddimah.jpg',
    created_at: '2026-01-20',
    images: []
  },
  {
    id: '5',
    title: 'ألف ليلة وليلة',
    slug: 'alf-layla',
    author: 'مجهول',
    publisher: 'دار صادر',
    category: 'أدب وشعر',
    price: 35000,
    stock: 3,
    description: 'مجموعة من القصص الشعبية التي جُمعت على مدى قرون من مصادر هندية وفارسية وعربية، وتُعدّ من أشهر الأعمال الأدبية في التاريخ.',
    cover_url: '/covers/alf-layla.jpg',
    created_at: '2026-02-28',
    images: []
  },
  {
    id: '6',
    title: 'الأمير الصغير',
    slug: 'the-little-prince',
    author: 'أنطوان دو سانت إكزوبيري',
    publisher: 'دار المعارف',
    category: 'روايات عالمية مترجمة',
    price: 15000,
    stock: 20,
    description: 'رواية شاعرية فلسفية للكاتب الفرنسي أنطوان دو سانت إكزوبيري، تروي قصة طيار يلتقي بأمير صغير في الصحراء.',
    cover_url: '/covers/little-prince.jpg',
    created_at: '2026-03-12',
    images: []
  },
  {
    id: '7',
    title: 'قواعد العشق الأربعون',
    slug: 'rules-of-love',
    author: 'إليف شافاق',
    publisher: 'دار طوى',
    category: 'روايات عالمية مترجمة',
    price: 22000,
    stock: 0,
    description: 'رواية تدور حول العلاقة الروحية بين جلال الدين الرومي وشمس التبريزي، تمزج بين الماضي والحاضر في سرد ممتع.',
    cover_url: '/covers/rules-of-love.jpg',
    created_at: '2026-04-01',
    images: []
  },
  {
    id: '8',
    title: 'فن الحرب',
    slug: 'art-of-war',
    author: 'سون تزو',
    publisher: 'مكتبة جرير',
    category: 'فكر وفلسفة',
    price: 14000,
    stock: 18,
    description: 'أقدم كتاب عسكري في العالم، كتبه الاستراتيجي الصيني سون تزو قبل 2500 عام. لا يزال يُستخدم كمرجع في الاستراتيجية والقيادة.',
    cover_url: '/covers/art-of-war.jpg',
    created_at: '2026-04-15',
    images: []
  },
  {
    id: '9',
    title: 'العادات الذرية',
    slug: 'atomic-habits',
    author: 'جيمس كلير',
    publisher: 'دار التنوير',
    category: 'تطوير الذات',
    price: 20000,
    stock: 25,
    description: 'كتاب يقدم إطاراً عملياً لبناء عادات جيدة والتخلص من العادات السيئة من خلال تغييرات صغيرة تحقق نتائج مذهلة.',
    cover_url: '/covers/atomic-habits.jpg',
    created_at: '2026-05-01',
    images: []
  },
  {
    id: '10',
    title: 'تاريخ الطبري',
    slug: 'tarikh-tabari',
    author: 'ابن جرير الطبري',
    publisher: 'دار الكتب العلمية',
    category: 'تاريخ إسلامي وعام',
    price: 45000,
    stock: 6,
    description: 'أحد أهم كتب التاريخ الإسلامي، يغطي تاريخ العالم من بدء الخليقة إلى عصر المؤلف في القرن العاشر الميلادي.',
    cover_url: '/covers/tabari.jpg',
    created_at: '2026-05-20',
    images: []
  },
  {
    id: '11',
    title: 'الطفل في الإسلام',
    slug: 'child-in-islam',
    author: 'محمد الريشهري',
    publisher: 'دار الحديث',
    category: 'كتب الأطفال وتربيتهم',
    price: 16000,
    stock: 10,
    description: 'كتاب شامل عن حقوق الطفل وتربيته في الإسلام مع أحاديث ومرويات أهل البيت عليهم السلام.',
    cover_url: '/covers/child-islam.jpg',
    created_at: '2026-06-01',
    images: []
  },
  {
    id: '12',
    title: 'سيرة الإمام علي',
    slug: 'imam-ali-biography',
    author: 'باقر شريف القرشي',
    publisher: 'دار التعارف',
    category: 'سير ذاتية',
    price: 30000,
    stock: 7,
    description: 'سيرة شاملة ومفصلة عن حياة الإمام علي بن أبي طالب عليه السلام من الولادة حتى الشهادة.',
    cover_url: '/covers/imam-ali.jpg',
    created_at: '2026-06-15',
    images: []
  },
];

export const CATEGORIES = [
  { name: 'كتب دينية وإسلامية', slug: 'religious', icon: '🕌', count: 0 },
  { name: 'فكر وفلسفة', slug: 'philosophy', icon: '💭', count: 0 },
  { name: 'تاريخ إسلامي وعام', slug: 'history', icon: '📜', count: 0 },
  { name: 'روايات عربية', slug: 'arabic-novels', icon: '📖', count: 0 },
  { name: 'روايات عالمية مترجمة', slug: 'translated-novels', icon: '🌍', count: 0 },
  { name: 'أدب وشعر', slug: 'literature', icon: '✍️', count: 0 },
  { name: 'علم نفس واجتماع', slug: 'psychology', icon: '🧠', count: 0 },
  { name: 'تطوير الذات', slug: 'self-development', icon: '🚀', count: 0 },
  { name: 'سير ذاتية', slug: 'biographies', icon: '👤', count: 0 },
  { name: 'سياسة وفكر معاصر', slug: 'politics', icon: '⚖️', count: 0 },
  { name: 'كتب الأطفال وتربيتهم', slug: 'children', icon: '🧒', count: 0 },
  { name: 'قرطاسية ومستلزمات القراءة', slug: 'stationery', icon: '📝', count: 0 },
];

// Helper function to get books (from Supabase or demo data)
export async function getBooks() {
  if (!supabase) {
    return DEMO_BOOKS;
  }
  
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching books:', error);
    return DEMO_BOOKS;
  }
  
  return data?.length > 0 ? data : DEMO_BOOKS;
}

export async function getBookBySlug(slug) {
  if (!supabase) {
    return DEMO_BOOKS.find(b => b.slug === slug) || null;
  }
  
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    return DEMO_BOOKS.find(b => b.slug === slug) || null;
  }
  
  return data;
}

export async function getBooksByCategory(category) {
  if (!supabase) {
    return DEMO_BOOKS.filter(b => b.category === category);
  }
  
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });
  
  if (error) {
    return DEMO_BOOKS.filter(b => b.category === category);
  }
  
  return data?.length > 0 ? data : DEMO_BOOKS.filter(b => b.category === category);
}

