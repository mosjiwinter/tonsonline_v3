import { NextRequest, NextResponse } from 'next/server';

const googleAppsScriptUrl = 'https://script.google.com/macros/s/AKfycbxA42tILKuUo4AYfSXxcpYtkQPN0StzzDMLV2uYkRv6Mt1yh5OJQTmqhJtfFkl5ERKM/exec';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const response = await fetch(googleAppsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      username,
      password,
    }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json({ success: false, message: 'Response ไม่ใช่ JSON' }, { status: 500 });
  }

  if (data.success) {
    const res = NextResponse.json({ success: true });

    res.cookies.set('token', data.userId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 วัน
    });
    res.cookies.set('name', data.name, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 วัน
    });
    res.cookies.set('role', data.role || 'staff', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 วัน
    });

    return res;
  } else {
    return NextResponse.json({ success: false, message: data.message }, { status: 401 });
  }
}

export async function GET() {
  return NextResponse.json({ success: false, message: 'Method Not Allowed' }, { status: 405 });
}