// import { NextResponse } from 'next/server';
// import redis from '@/app/lib/redis';

// export async function POST(request) {
//   try {
//     const { sessionId } = await request.json();
    
//     if (!sessionId) {
//       return NextResponse.json(
//         { valid: false, message: "Session ID not provided" },
//         { status: 400 }
//       );
//     }

//     // Redisdan sessionni olish
//     const sessionData = await redis.get(`session:${sessionId}`);

//     console.log(sessionData);
    

//     if (!sessionData) {
//       return NextResponse.json(
//         { valid: false, message: "Session not found" },
//         { status: 404 }
//       );
//     }

//     // String formatdagi JSONni obyektga aylantirish
//     const session = JSON.parse(sessionData);

//     if (session.status === 'completed') {
//       return NextResponse.json(
//         { valid: false, message: "Session already completed" },
//         { status: 403 }
//       );
//     }

//     return NextResponse.json({ valid: true, session });
//   } catch (error) {
//     console.error("Session validation error:", error);
//     return NextResponse.json(
//       { valid: false, message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
