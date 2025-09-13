// export const dynamic = 'force-dynamic'; 

export async function GET() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://37.27.23.255:2222';
  
  try {
    const response = await fetch(`https://test.smartcoders.uz/student_test/test/all-category/`, {
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