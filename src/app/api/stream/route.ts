import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const headers = new Headers();
    if (request.headers.get('range')) {
      headers.set('Range', request.headers.get('range')!);
    }

    const upstreamResponse = await fetch(url, {
      headers: {
        'User-Agent': 'IPTV-Player/1.0',
        ...Object.fromEntries(headers.entries()),
      },
      // Important: Disable caching for streams to avoid memory issues
      cache: 'no-store', 
    });

    if (!upstreamResponse.ok) {
      return new NextResponse(`Upstream error: ${upstreamResponse.status}`, { 
        status: upstreamResponse.status 
      });
    }

    const responseHeaders = new Headers();
    // Copy relevant headers for streaming
    const headersToForward = [
      'Content-Type',
      'Content-Length',
      'Content-Range',
      'Accept-Ranges',
      'Last-Modified',
      'ETag'
    ];

    headersToForward.forEach(header => {
      const value = upstreamResponse.headers.get(header);
      if (value) responseHeaders.set(header, value);
    });
    
    // Allow CORS
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Stream proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  return new NextResponse(null, { headers });
}
