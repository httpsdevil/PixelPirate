// app/api/image-proxy/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
    // Get the 'url' parameter from the request
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    try {
        // Fetch the image from the Instagram CDN URL
        const response = await axios.get(url, {
            responseType: 'arraybuffer', // Get the image data as a buffer
        });

        // Get the content type from the original response
        const contentType = response.headers['content-type'];

        // Return the image data in a NextResponse
        return new NextResponse(response.data, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                // Optional: Add caching headers
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
            },
        });

    } catch (error) {
        console.error('Image proxy error:', error.message);
        return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 });
    }
}