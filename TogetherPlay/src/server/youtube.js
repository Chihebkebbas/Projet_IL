// Server-side YouTube proxy: keeps API key off the client and applies
// university-friendly filters (safe search, education category, French).

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const cache = new Map();
const TTL_MS = 60 * 60 * 1000;

function getCached(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.at > TTL_MS) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

function setCached(key, data) {
    cache.set(key, { data, at: Date.now() });
}

function mapItem(item) {
    return {
        id: item.id.videoId || item.id,
        title: item.snippet.title,
        thumbnail:
            item.snippet.thumbnails?.high?.url ||
            item.snippet.thumbnails?.medium?.url,
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description
    };
}

async function callYouTube(endpoint, params) {
    const apiKey = process.env.YT_API_KEY;
    if (!apiKey) {
        const err = new Error('YT_API_KEY missing on server');
        err.status = 500;
        throw err;
    }
    const url = new URL(`${BASE_URL}/${endpoint}`);
    for (const [k, v] of Object.entries(params)) {
        url.searchParams.append(k, String(v));
    }
    url.searchParams.append('key', apiKey);

    const resp = await fetch(url.toString());
    if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        const err = new Error(body?.error?.message || 'YouTube API error');
        err.status = resp.status;
        throw err;
    }
    return resp.json();
}

export async function searchVideos(query) {
    const q = String(query || '').trim();
    if (!q) return [];
    if (q.length > 100) {
        const err = new Error('Requête trop longue');
        err.status = 400;
        throw err;
    }
    const cacheKey = `search:${q.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const data = await callYouTube('search', {
        part: 'snippet',
        q,
        type: 'video',
        maxResults: 12,
        safeSearch: 'strict',
        videoEmbeddable: 'true',
        relevanceLanguage: 'fr'
    });
    const results = (data.items || []).map(mapItem);
    setCached(cacheKey, results);
    return results;
}

// University-friendly suggestions: education category, safe search, French,
// embeddable, recent. Used on the home page when no search is active.
export async function getSuggestions() {
    const cacheKey = 'suggestions:university';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const data = await callYouTube('search', {
        part: 'snippet',
        q: 'cours informatique université conférence',
        type: 'video',
        videoCategoryId: '27',
        videoEmbeddable: 'true',
        safeSearch: 'strict',
        relevanceLanguage: 'fr',
        regionCode: 'FR',
        order: 'relevance',
        maxResults: 12
    });
    const results = (data.items || []).map(mapItem);
    setCached(cacheKey, results);
    return results;
}
