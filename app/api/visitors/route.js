import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const VISITORS_FILE = path.join(DATA_DIR, 'visitors.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(VISITORS_FILE)) {
    fs.writeFileSync(VISITORS_FILE, JSON.stringify({ total: 0, today: 0, lastReset: new Date().toDateString() }, null, 2), 'utf-8');
  }
}

function readVisitors() {
  ensureDataDir();
  try {
    const data = fs.readFileSync(VISITORS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { total: 0, today: 0, lastReset: new Date().toDateString() };
  }
}

function writeVisitors(visitors) {
  ensureDataDir();
  fs.writeFileSync(VISITORS_FILE, JSON.stringify(visitors, null, 2), 'utf-8');
}

// GET - عرض العداد
export async function GET() {
  try {
    const visitors = readVisitors();
    // Reset today count if it's a new day
    const today = new Date().toDateString();
    if (visitors.lastReset !== today) {
      visitors.today = 0;
      visitors.lastReset = today;
      writeVisitors(visitors);
    }
    return NextResponse.json({ success: true, ...visitors });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - زيادة العداد (عند زيارة جديدة)
export async function POST() {
  try {
    const visitors = readVisitors();
    const today = new Date().toDateString();

    if (visitors.lastReset !== today) {
      visitors.today = 0;
      visitors.lastReset = today;
    }

    visitors.total += 1;
    visitors.today += 1;
    writeVisitors(visitors);

    return NextResponse.json({ success: true, ...visitors });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
