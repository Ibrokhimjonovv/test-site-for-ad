// app/api/send-sms/route.js
export async function POST(request) {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      const body = await request.json();
      
      // Validation
      if (!body.phone) {
        return Response.json({ error: 'Telefon raqam kiritilishi shart' }, {
          status: 400
        });
      }
  
      // Clean phone number (remove +, spaces, etc.)
      const cleanedPhone = body.phone.replace(/\D/g, '');
      
      // Validate Uzbek phone number format
      if (!/^998\d{9}$/.test(cleanedPhone)) {
        return Response.json({ error: 'Noto\'g\'ri telefon raqam formati' }, {
          status: 400
        });
      }
  
      const response = await fetch(`${API_BASE}/api/send-sms/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: cleanedPhone
        })
      });
  
      const data = await response.json();
      
  
      if (!response.ok) {
        return Response.json({ 
          error: data.message || 'SMS yuborish muvaffaqiyatsiz' 
        }, {
          status: response.status
        });
      }
  
      return Response.json({
        success: true,
        message: 'SMS kod yuborildi',
        // Don't include sensitive data in production
        // code: data.code // Only for development/testing
      }, { 
        status: 200 
      });
      
    } catch (error) {
      console.error('SMS yuborishda xatolik:', error);
      return Response.json({ 
        error: error.message || 'Server xatosi' 
      }, {
        status: 500
      });
    }
  }