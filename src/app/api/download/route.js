import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { supabase } from '../../lib/supabaseClient';
import { UAParser } from 'ua-parser-js';

// =================================================================================
// SCRAPING FUNCTIONS (Instagram & Pinterest are unchanged)
// =================================================================================

async function getInstagramImages(username) {
    let previewUrl = null, downloadUrl = null, name = null;
    try {
        const initialResponse = await axios.get('https://www.instagram.com/', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36' } });
        const cookies = initialResponse.headers['set-cookie']?.join('; ') || '';
        const dataUrl = `https://www.instagram.com/${username}/?__a=1&__d=dis`;
        const { data: jsonData } = await axios.get(dataUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36', 'Cookie': cookies } });
        downloadUrl = jsonData.graphql?.user?.profile_pic_url_hd;
        previewUrl = jsonData.graphql?.user?.profile_pic_url;
        name = jsonData.graphql?.user?.full_name;
    } catch (error) { console.warn(`Raw data endpoint failed for ${username}. Trying fallbacks.`); }
    try {
        if (!downloadUrl || !name) {
            const profileApiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
            const { data: profileJson } = await axios.get(profileApiUrl, { headers: { 'x-ig-app-id': '936619743392459', 'User-Agent': 'Mozilla/5.0' } });
            if (!downloadUrl) downloadUrl = profileJson.data?.user?.profile_pic_url_hd;
            if (!name) name = profileJson.data?.user?.full_name;
        }
    } catch (error) { console.warn(`Web API fallback failed for ${username}.`); }
    try {
        if (!previewUrl) {
            const profileUrl = `https://www.instagram.com/${username}/`;
            const { data: html } = await axios.get(profileUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const $ = cheerio.load(html);
            previewUrl = $('meta[property="og:image"]').attr('content');
            if (!name) { const title = $('title').text(); name = title.split('(')[0].trim(); }
        }
    } catch (error) { console.error(`Final HTML scrape failed for ${username}:`, error.message); return null; }
    if (!previewUrl && !downloadUrl) { return null; }
    return { previewUrl: previewUrl || downloadUrl, downloadUrl: downloadUrl || previewUrl, username: username, name: name || username };
}

async function getPinterestImages(url) {
    try {
        url = url.toLowerCase();
        const usernameMatch = url.match(/pinterest\.com\/([a-zA-Z0-9_]+)/);
        const username = usernameMatch ? usernameMatch[1].replace('/', '') : null;
        const { data: html } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(html);
        let imageUrl = null, name = null;
        const jsonLdScript = $('script[type="application/ld+json"]').first();
        if (jsonLdScript.length) {
            try {
                const jsonLdData = JSON.parse(jsonLdScript.html() || '{}');
                if (jsonLdData.mainEntity) {
                    name = jsonLdData.mainEntity.name;
                    imageUrl = typeof jsonLdData.mainEntity.image === 'string' ? jsonLdData.mainEntity.image : jsonLdData.mainEntity.image?.contentUrl;
                }
            } catch (e) { console.error("Pinterest JSON-LD parse error:", e.message); }
        }
        if (!name) { const title = $('title').text(); name = title.split('(')[0].trim(); }
        if (!imageUrl) { imageUrl = $('meta[property="og:image"]').attr('content'); }
        if (!imageUrl) return null;
        const previewUrl = imageUrl;
        const downloadUrl = imageUrl.replace(/(\d+|[a-zA-Z]+)x(\d+|[a-zA-Z]+)?(_\w+)?/, 'originals');
        return { previewUrl, downloadUrl, username, name: name || username };
    } catch (e) { console.error("Pinterest fetch failed:", e.message); return null; }
}

// =================================================================================
// *** FINAL, ROBUST YOUTUBE FUNCTION (Fixed Shorts thumbnail & URL normalization) ***
// =================================================================================
async function getYouTubeImage(url) {
    console.log(`[LOG] YouTube: Starting fetch for URL: ${url}`);
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                // Use a more recent and specific User-Agent
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
            }
        });
        console.log(`[LOG] YouTube: Successfully fetched HTML. Length: ${html.length}`);

        const $ = cheerio.load(html);

        let imageUrl = null;
        let name = null;
        let username = null;

        // Try to get og:image first - it's usually the most reliable for thumbnails
        imageUrl = $('meta[property="og:image"]').attr('content');
        console.log(`[LOG] YouTube: Found og:image URL: ${imageUrl || 'Not Found'}`);

        // If og:image is found, we might not need to dive into ytInitialData for the image.
        // However, we still need name and username, so we'll proceed with ytInitialData parsing.

        let initialData = null;
        const scripts = $('script');
        scripts.each((index, element) => {
            const scriptContent = $(element).html();
            if (scriptContent?.includes('var ytInitialData = ')) {
                console.log('[LOG] YouTube: Found script tag containing ytInitialData.');
                const jsonString = scriptContent.split('var ytInitialData = ')[1].split(';')[0];
                try {
                    initialData = JSON.parse(jsonString);
                    console.log('[LOG] YouTube: Successfully parsed ytInitialData.');
                    // LOG: Log a summary of the initialData structure to debug differences
                    console.log('[LOG] YouTube: ytInitialData top-level keys:', Object.keys(initialData || {}));
                    console.log('[LOG] YouTube: ytInitialData overlay exists:', !!initialData.overlay);
                    console.log('[LOG] YouTube: ytInitialData contents exists:', !!initialData.contents);
                    console.log('[LOG] YouTube: ytInitialData header exists:', !!initialData.header);

                } catch (e) {
                    console.error("[ERROR] YouTube: Failed to parse ytInitialData JSON:", e.message);
                }
            }
        });

        if (initialData) {
            // LOG: Detailed paths for Shorts
            const shortsReelPlayerOverlay = initialData.overlay?.reelPlayerOverlayRenderer;
            if (shortsReelPlayerOverlay) {
                console.log('[LOG] YouTube: Detected Shorts overlay structure.');
                const shortsReelPlayerHeader = shortsReelPlayerOverlay.reelPlayerHeaderSupportedRenderers?.reelPlayerHeaderRenderer;
                const shortsMetapanel = shortsReelPlayerOverlay.metapanel?.reelMetapanelViewModel?.metadataItems?.[0]?.reelChannelBarViewModel;

                if (shortsReelPlayerHeader) {
                    name = shortsReelPlayerHeader.reelTitleText?.runs?.[0]?.text;
                    username = shortsMetapanel?.channelName?.content || shortsReelPlayerHeader.channelTitleText?.runs?.[0]?.text;
                    console.log(`[LOG] YouTube Shorts: Name - ${name}, Username - ${username}`);
                }
                // Try to find image from shorts specific paths if og:image wasn't available
                if (!imageUrl) {
                    imageUrl = shortsReelPlayerHeader?.thumbnail?.thumbnails?.pop()?.url;
                    console.log(`[LOG] YouTube Shorts: Image from ReelPlayerHeader thumbnail: ${imageUrl || 'Not Found'}`);
                }
            }

            // LOG: Detailed paths for Regular Videos
            else if (initialData.contents?.twoColumnWatchNextResults) {
                console.log('[LOG] YouTube: Detected Regular Video structure.');
                const videoPrimaryInfo = initialData.contents.twoColumnWatchNextResults.results.results.contents?.[0]?.videoPrimaryInfoRenderer;
                const videoSecondaryInfo = initialData.contents.twoColumnWatchNextResults.results.results.contents?.[1]?.videoSecondaryInfoRenderer;

                name = videoPrimaryInfo?.title?.runs?.[0]?.text;
                username = videoSecondaryInfo?.owner?.videoOwnerRenderer?.title?.runs?.[0]?.text;
                console.log(`[LOG] YouTube Video: Name - ${name}, Username - ${username}`);
            }
            // LOG: Detailed paths for Channel Pages
            else if (initialData.header?.c4TabbedHeaderRenderer) {
                console.log('[LOG] YouTube: Detected Channel Page structure.');
                const header = initialData.header.c4TabbedHeaderRenderer;
                name = header.title;
                username = header.channelHandleText?.runs?.[0]?.text || header.title;
                console.log(`[LOG] YouTube Channel: Name - ${name}, Username - ${username}`);
                if (!imageUrl) { // Use channel avatar if og:image wasn't available or relevant
                    imageUrl = header.avatar?.thumbnails?.pop()?.url;
                    console.log(`[LOG] YouTube Channel: Image from avatar thumbnail: ${imageUrl || 'Not Found'}`);
                }
            } else {
                console.log('[LOG] YouTube: initialData structure for videos/shorts/channels not matched.');
            }
        }

        // Generic Fallbacks (if initialData parsing or specific paths fail)
        if (!name) {
            name = $('title').text().split(' - YouTube')[0].trim();
            console.log(`[LOG] YouTube: Name from fallback title: ${name || 'Not Found'}`);
        }
        if (!username) {
            const ogSiteName = $('meta[property="og:site_name"]').attr('content');
            if (ogSiteName && ogSiteName.toLowerCase() !== 'youtube') {
                username = ogSiteName;
            } else {
                username = name; // Last resort: use the name as username
            }
            console.log(`[LOG] YouTube: Username from fallback og:site_name/name: ${username || 'Not Found'}`);
        }

        // --- FINAL CHECK FOR imageUrl ---
        // If imageUrl is still null from og:image or ytInitialData paths, try to find a generic thumbnail.
        // This is a last resort to provide *some* image if primary methods fail.
        if (!imageUrl) {
            // Attempt to construct a thumbnail URL from the video ID if available
            const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
            if (videoIdMatch && videoIdMatch[1]) {
                const videoId = videoIdMatch[1];
                imageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                // Check if this constructed URL is actually valid (optional, but good for robustness)
                try {
                    await axios.head(imageUrl); // Make a HEAD request to check if the image exists
                    console.log(`[LOG] YouTube: Constructed valid thumbnail URL from video ID: ${imageUrl}`);
                } catch (headError) {
                    console.warn(`[WARN] YouTube: Constructed thumbnail ${imageUrl} does not seem to exist.`);
                    imageUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; // Fallback to lower quality
                    try {
                        await axios.head(imageUrl);
                        console.log(`[LOG] YouTube: Constructed valid fallback thumbnail URL from video ID: ${imageUrl}`);
                    } catch (finalHeadError) {
                        console.warn(`[WARN] YouTube: Constructed fallback thumbnail ${imageUrl} also failed.`);
                        imageUrl = null; // No working thumbnail found
                    }
                }
            }
        }

        if (!imageUrl) {
            console.error(`[ERROR] YouTube: Could not find any image URL for: ${url} after all attempts. Returning null.`);
            return null;
        }

        console.log(`[LOG] YouTube: Image URL before cleanup: ${imageUrl}`);
        // Consider removing this aggressive URL cleaning. YouTube thumbnail URLs often have parameters.
        // If you still want to clean, make sure it's not cutting off essential parts.
        // For now, let's keep it but be aware this could be an issue.
        const jpgIndex = imageUrl.indexOf('.jpg');
        if (jpgIndex !== -1) {
            imageUrl = imageUrl.substring(0, jpgIndex + 4); // +4 to include ".jpg"
        }
        console.log(`[LOG] YouTube: Image URL after cleanup: ${imageUrl}`);

        const result = {
            previewUrl: imageUrl,
            downloadUrl: imageUrl, // For YouTube, preview and download can often be the same best quality
            username: username || "YouTube", // Fallback if no specific username found
            name: name || "YouTube Content", // Fallback if no specific name found
        };

        console.log('[LOG] YouTube: Returning final object:', result);
        return result;

    } catch (e) {
        console.error(`[CRITICAL ERROR] YouTube fetch failed for ${url}:`, e.message);
        // Log more error details if possible
        if (e.response) {
            console.error(`[CRITICAL ERROR] YouTube: Response status: ${e.response.status}, data: ${e.response.data.substring(0, 200)}...`);
        }
        return null;
    }
}

// =================================================================================
// LOGGING FUNCTION (Unchanged)
// =================================================================================
async function logAndCount(request, submittedUrl) {
    try {
        const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
        const userAgent = request.headers.get('user-agent');
        const referrer = request.headers.get('referer') ?? 'direct';
        const parser = new UAParser(userAgent);
        const agentInfo = parser.getResult();
        const browser_name = agentInfo.browser.name ?? 'unknown', browser_version = agentInfo.browser.version ?? 'unknown', os_name = agentInfo.os.name ?? 'unknown', os_version = agentInfo.os.version ?? 'unknown', device_vendor = agentInfo.device.vendor ?? 'unknown', device_model = agentInfo.device.model ?? 'unknown';
        let location = { city: 'unknown', region: 'unknown', country: 'unknown' };
        if (ip && ip !== '::1' && ip !== '127.0.0.1') {
            try {
                const geo = await axios.get(`http://ip-api.com/json/${ip}?fields=city,regionName,country`);
                location = { city: geo.data.city, region: geo.data.regionName, country: geo.data.country };
            } catch (geoError) { console.error("Geolocation lookup failed."); }
        } else { location.city = 'local'; }
        const logData = { ip_address: ip, location_city: location.city, location_region: location.region, location_country: location.country, browser_name, browser_version, os_name, os_version, device_vendor, device_model, referrer, url_submitted: submittedUrl };
        const [insertResult, rpcResult] = await Promise.all([supabase.from('logs').insert(logData), supabase.rpc('increment_request_count')]);
        if (insertResult.error) console.error('Supabase insert error:', insertResult.error.message);
        if (rpcResult.error) console.error('Supabase RPC error:', rpcResult.error.message);
    } catch (error) { console.error("Critical error in logging function:", error); }
}

// =================================================================================
// POST HANDLER (Unchanged)
// =================================================================================
export async function POST(request) {
    try {
        const { url } = await request.json();
        logAndCount(request, url);
        let images = null;
        if (url.includes('instagram.com')) {
            const usernameMatch = url.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
            if (!usernameMatch || !usernameMatch[1]) { return NextResponse.json({ error: 'Could not extract Instagram username.' }, { status: 400 }); }
            const username = usernameMatch[1].replace('/', '');
            images = await getInstagramImages(username);
        } else if (url.includes('pinterest.com')) {
            if (url.includes('/pin/')) { return NextResponse.json({ error: 'Please provide a Pinterest profile URL, not a pin.' }, { status: 400 }); }
            images = await getPinterestImages(url);
        } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            images = await getYouTubeImage(url);
        } else {
            return NextResponse.json({ error: 'Only Instagram, Pinterest, and YouTube profile URLs are supported.' }, { status: 400 });
        }
        if (!images || !images.previewUrl) {
            return NextResponse.json({ error: 'Could not find a profile picture.' }, { status: 404 });
        }
        return NextResponse.json(images);
    } catch (error) {
        console.error("Server error:", error.message);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}