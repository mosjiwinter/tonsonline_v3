import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch('https://script.google.com/macros/s/AKfycbyP6mK7u3SSOS5V5BwqzTuY7FpG3aOdWMCph0tOW-aFVdXBrgZ5nlQ2-j287Prt0WWL/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid response from Apps Script' }, { status: 500 });
    }

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}