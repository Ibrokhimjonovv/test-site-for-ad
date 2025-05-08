import { NextResponse } from "next/server";
import sessions from "@/lib/session-store";

export async function POST(request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { valid: false, message: "Session ID not provided" },
        { status: 400 }
      );
    }

    const sessionData = sessions.get(sessionId);

    if (!sessionData) {
      return NextResponse.json(
        { valid: false, message: "Session not found" },
        { status: 404 }
      );
    }

    if (sessionData.status === "completed") {
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
