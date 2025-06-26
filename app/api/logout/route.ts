import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true });

  res.cookies.set('token', '', { maxAge: -1, path: '/' });
  res.cookies.set('name', '', { maxAge: -1, path: '/' });
  res.cookies.set('role', '', { maxAge: -1, path: '/' });

  return res;
}