export async function POST(request) {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      const body = await request.json();
      
      // Validatsiya
      if (!body.login || !body.password) {
        return new Response(JSON.stringify({ error: 'Login va parol kiritilishi shart' }), {
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
          login: body.login,
          password: body.password,
          action: 'login'
        })
      });
  
      const data = await response.json();
      console.log(response);
      
  
      if (!response.ok) {
        return new Response(JSON.stringify({ error: data.error || 'Kirish muvaffaqiyatsiz' }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ error: error.error || 'Server xatosi' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }