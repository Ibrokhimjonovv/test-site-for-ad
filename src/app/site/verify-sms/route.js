import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const { phone, code } = await request.json()
        const API_BASE = process.env.NEXT_PUBLIC_API_URL;
        

        // // Validatsiya
        // if (!phone || !/^998\d{9}$/.test(phone)) {
        //     return NextResponse.json(
        //         { error: "Telefon raqam noto'g'ri formatda" },
        //         { status: 400 }
        //     )
        // }

        // if (!code || !/^\d{4}$/.test(code)) {
        //     return NextResponse.json(
        //         { error: "Tasdiqlash kodi noto'g'ri formatda" },
        //         { status: 400 }
        //     )
        // }

        const response = await fetch(`${API_BASE}/api/verify-sms/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phone,
                code
            })
        });

        const data = await response.json();


        if (!response.ok) {
            return Response.json({
                error: data.error || 'SMS yuborish muvaffaqiyatsiz'
            }, {
                status: response.status
            });
        }

        // Demo uchun - faqat 1234 kodini qabul qilamiz
        // if (code !== "1234") {
        //   return NextResponse.json(
        //     { error: "Noto'g'ri tasdiqlash kodi" },
        //     { status: 401 }
        //   )
        // }

        // Agar hamma narsa to'g'ri bo'lsa
        return NextResponse.json({
            success: true,
            message: "Telefon raqam muvaffaqiyatli tasdiqlandi",
            token: "generated-jwt-token" // Haqiqiy loyihada JWT yoki session token yuborishingiz kerak
        })

    } catch (error) {
        console.error('Tasdiqlashda xatolik:', error)
        return NextResponse.json(
            { error: "Server xatosi" },
            { status: 500 }
        )
    }
}