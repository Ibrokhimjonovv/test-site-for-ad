// export const dynamic = 'force-dynamic'; 

export async function GET() {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://test.smartcoders.uz';
    
    try {
      const response = await fetch(`${API_BASE}/api/tests_title/`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return Response.json({
        success: true,
        data: data
      });
    } catch (error) {
      return Response.json({
        success: false,
        error: error.message
      }, {
        status: 500
      });
    }
  }