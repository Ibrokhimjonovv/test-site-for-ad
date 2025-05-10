export async function POST(request) {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      const body = await request.json();
      
      // Validatsiya
      if (!body.phone_number || !body.password) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      const cleanedPhone = body.phone_number.replace(/\D/g, '').slice(-9);
      if (cleanedPhone.length !== 9) {
        return new Response(JSON.stringify({ error: 'Invalid phone number' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      const response = await fetch(`${API_BASE}/user/auth/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...body,
          phone_number: `+998${cleanedPhone}`,
          action: 'signup'
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        return new Response(JSON.stringify({ error: data.message || 'Registration failed' }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message || 'Server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }