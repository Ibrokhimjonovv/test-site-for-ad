import { NextResponse } from 'next/server';


export async function GET(request) {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL;
    
    try {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader) {
            return NextResponse.json(
                { error: "Authorization header missing" },
                { status: 401 }
            );
        }

        // Asl backend API manziliga so'rov
        const backendResponse = await fetch(`${API_BASE}/user/profile/`, { // Bu ham frontenddagi bilan bir xil bo'lishi kerak
            headers: {
                Authorization: authHeader, // Bearer bilan birga
                "Content-Type": "application/json",
            },
        });

        if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            console.error("Backend error:", errorText); // Debug
            return NextResponse.json(
                { error: errorText },
                { status: backendResponse.status }
            );
        }

        const data = await backendResponse.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("API route error:", error); // Debug
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}