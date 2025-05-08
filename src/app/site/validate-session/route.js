import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { valid: false, message: "Session ID not provided" },
        { status: 400 }
      );
    }

    // Sessionni tekshirish

    
    const sessionData = await kv.get(`session:${sessionId}`);
    
    if (!sessionData) {
      return NextResponse.json(
        { valid: false, message: "Session not found" },
        { status: 404 }
      );
    }

    // Session allaqachon yakunlangan bo'lsa
    if (sessionData.status === 'completed') {
      return NextResponse.json(
        { valid: false, message: "Session already completed" },
        { status: 403 }
      );
    }

    return NextResponse.json({ valid: true, session: sessionData });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json(
      { valid: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}