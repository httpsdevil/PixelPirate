// app/api/image-proxy/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    try {
        // --- THIS IS THE MODIFIED PART ---
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                // Add a browser-like User-Agent
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                // Add the Referer header - this is often the key to unblocking images
                'Referer': 'https://www.instagram.com/'
            }
        });
        // --- END OF MODIFIED PART ---
        
        const contentType = response.headers['content-type'];

        return new NextResponse(response.data, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
            },
        });

    } catch (error) {
        console.error('Image proxy error:', error.message);
        // Provide a more specific error message if possible
        if (error.response) {
            console.error(`Proxy request failed with status: ${error.response.status}`);
        }
        return NextResponse.json({ error: 'Failed to proxy image due to server block.' }, { status: 500 });
    }
}