// Netlify Functions API - Health endpoint
exports.handler = async (event, context) => {
  console.log('Health function called:', event.httpMethod);
  
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      environment: 'netlify'
    })
  };
};