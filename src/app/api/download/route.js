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
// *** YOUTUBE FUNCTION WITH DETAILED LOGGING ***
// =================================================================================
async function getYouTubeImage(url) {
    // LOG: Log the start of the function and the URL being processed.
    console.log(`[LOG] YouTube: Starting fetch for URL: ${url}`);
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
            }
        });
        // LOG: Confirm that HTML was fetched successfully and log its size.
        console.log(`[LOG] YouTube: Successfully fetched HTML. Length: ${html.length}`);

        const $ = cheerio.load(html);

        let imageUrl = null;
        let name = null;
        let username = null;

        // Always try to get the og:image first, it's usually the best thumbnail
        imageUrl = $('meta[property="og:image"]').attr('content');
        // LOG: Log the result of the og:image search. This is a critical piece of data.
        console.log(`[LOG] YouTube: Found og:image URL: ${imageUrl || 'Not Found'}`);


        let initialData = null;
        const scripts = $('script');
        scripts.each((index, element) => {
            const scriptContent = $(element).html();
            if (scriptContent?.includes('var ytInitialData = ')) {
                // LOG: Confirm that the script containing ytInitialData was found.
                console.log('[LOG] YouTube: Found script tag containing ytInitialData.');
                const jsonString = scriptContent.split('var ytInitialData = ')[1].split(';')[0];
                try {
                    initialData = JSON.parse(jsonString);
                    // LOG: Confirm successful parsing of the JSON data.
                    console.log('[LOG] YouTube: Successfully parsed ytInitialData.');
                } catch (e) {
                    // LOG: Log an error if JSON parsing fails.
                    console.error("[ERROR] YouTube: Failed to parse ytInitialData JSON:", e.message);
                }
            }
        });

        if (initialData) {
            // ... (rest of the initialData logic)
            const shortsReelPlayerHeader = initialData.overlay?.reelPlayerOverlayRenderer?.reelPlayerHeaderSupportedRenderers?.reelPlayerHeaderRenderer;
            const shortsMetapanel = initialData.overlay?.reelPlayerOverlayRenderer?.metapanel?.reelMetapanelViewModel?.metadataItems?.[0]?.reelChannelBarViewModel;

            if (shortsReelPlayerHeader) {
                name = shortsReelPlayerHeader.reelTitleText?.runs?.[0]?.text;
                username = shortsMetapanel?.channelName?.content || shortsReelPlayerHeader.channelTitleText?.runs?.[0]?.text;
            }
            else if (initialData.contents?.twoColumnWatchNextResults) {
                const videoPrimaryInfo = initialData.contents.twoColumnWatchNextResults.results.results.contents?.[0]?.videoPrimaryInfoRenderer;
                const videoSecondaryInfo = initialData.contents.twoColumnWatchNextResults.results.results.contents?.[1]?.videoSecondaryInfoRenderer;
                name = videoPrimaryInfo?.title?.runs?.[0]?.text;
                username = videoSecondaryInfo?.owner?.videoOwnerRenderer?.title?.runs?.[0]?.text;
            }
            else if (initialData.header?.c4TabbedHeaderRenderer) {
                const header = initialData.header.c4TabbedHeaderRenderer;
                name = header.title;
                username = header.channelHandleText?.runs?.[0]?.text || header.title;
                if (!imageUrl) {
                    imageUrl = header.avatar?.thumbnails?.pop()?.url;
                }
            }
        }

        if (!name) {
            name = $('title').text().split(' - YouTube')[0].trim();
        }
        if (!username) {
            const ogSiteName = $('meta[property="og:site_name"]').attr('content');
            if (ogSiteName && ogSiteName.toLowerCase() !== 'youtube') {
                username = ogSiteName;
            } else {
                username = name;
            }
        }

        if (!imageUrl) {
            // LOG: Critical error if no image URL could be found after all attempts.
            console.error(`[ERROR] YouTube: Could not find any image URL for: ${url}. Returning null.`);
            return null;
        }

        // LOG: Log the image URL before the final cleaning step.
        console.log(`[LOG] YouTube: Image URL before cleanup: ${imageUrl}`);
        const jpgIndex = imageUrl.indexOf('.jpg');
        if (jpgIndex !== -1) {
            imageUrl = imageUrl.substring(0, jpgIndex + 4);
        }
        // LOG: Log the image URL after the final cleaning step.
        console.log(`[LOG] YouTube: Image URL after cleanup: ${imageUrl}`);

        const result = {
            previewUrl: imageUrl,
            downloadUrl: imageUrl,
            username: username,
            name: name,
        };

        // LOG: Log the final object that will be returned to the frontend.
        console.log('[LOG] YouTube: Returning final object:', result);
        return result;

    } catch (e) {
        // LOG: Catch any unexpected errors during the entire process.
        console.error(`[CRITICAL ERROR] YouTube fetch failed for ${url}:`, e.message);
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