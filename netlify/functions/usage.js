const API_BASE = 'https://api.weather-ai.co';

exports.handler = async (event) => {
  try {
    const authHeader = event.headers.authorization || '';

    const response = await fetch(`${API_BASE}/v1/usage`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': authHeader
      }
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};