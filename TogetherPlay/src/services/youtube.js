import { API_URL } from './api.js';

const SUGGESTIONS_KEY = 'tp:suggestions:v1';
const SUGGESTIONS_TTL = 60 * 60 * 1000;

function readCache(key, ttl) {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        const { at, data } = JSON.parse(raw);
        if (Date.now() - at > ttl) return null;
        return data;
    } catch {
        return null;
    }
}

function writeCache(key, data) {
    try {
        sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
    } catch { /* ignore quota */ }
}

async function getJson(path) {
    const resp = await fetch(`${API_URL}${path}`);
    if (!resp.ok) {
        let msg = 'Erreur YouTube';
        try { msg = (await resp.json())?.error || msg; } catch { /* ignore */ }
        throw new Error(msg);
    }
    return resp.json();
}

export async function searchVideos(query) {
    return getJson(`/api/youtube/search?q=${encodeURIComponent(query)}`);
}

// University-friendly suggestions: cached locally for 1h to save quota.
export async function getPopularVideos() {
    const cached = readCache(SUGGESTIONS_KEY, SUGGESTIONS_TTL);
    if (cached) return cached;
    const data = await getJson('/api/youtube/suggestions');
    writeCache(SUGGESTIONS_KEY, data);
    return data;
}
