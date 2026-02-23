export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, username, password, action, ...params } = body;

    if (!url || !username || !password) {
      return NextResponse.json(
        { error: 'Missing required credentials' },
        { status: 400 }
      );
    }

    // Build Xtream API URL
    const baseUrl = url.replace(/\/+$/, ''); // Remove trailing slashes
    let apiUrl = `${baseUrl}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

    // Add action if specified
    if (action) {
      apiUrl += `&action=${encodeURIComponent(action)}`;
    }

    // Add additional params
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        apiUrl += `&${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
      }
    });

    // Fetch from Xtream server
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'IPTV-Player/1.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Xtream API error: ${response.status}` },
        { status: response.status }
      );
    }

    // Handle XMLTV endpoint
    if (params.endpoint === 'xmltv') {
      const xmlUrl = `${baseUrl}/xmltv.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
      
      const response = await fetch(xmlUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'IPTV-Player/1.0' },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `XMLTV fetch error: ${response.status}` },
          { status: response.status }
        );
      }

      const xmlText = await response.text();
      
      // Parse XML to JSON
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
      });
      const jsonObj = parser.parse(xmlText);
      
      return NextResponse.json(jsonObj);
    }

    const data = await response.json();

    // Check for auth failure
    if (data.user_info?.auth === 0) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Xtream API proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET method for simple health check
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'xtream-proxy' });
}

