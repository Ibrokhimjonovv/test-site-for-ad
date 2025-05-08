import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request) {
  try {
    const { sessionId, status } = await request.json();
    
    // Session ma'lumotlarini yangilash
    await kv.set(`session:${sessionId}`, {
      status: status || 'active',
      lastActive: new Date().toISOString()
    }, { ex: 86400 }); // 24 soat muddat

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}