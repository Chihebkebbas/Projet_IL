const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export const searchVideos = async (query) => {
    if (!API_KEY) {
        throw new Error("Clé API YouTube manquante (VITE_YOUTUBE_API_KEY).");
    }

    try {
        const url = new URL(`${BASE_URL}/search`);
        url.searchParams.append("part", "snippet");
        url.searchParams.append("maxResults", "12");
        url.searchParams.append("q", query);
        url.searchParams.append("type", "video");
        url.searchParams.append("key", API_KEY);

        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || "Erreur lors de la recherche YouTube");
        }

        const data = await response.json();

        // Transform API format to our app format
        return data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url || item.snippet.thumbnails.medium.url,
            channelTitle: item.snippet.channelTitle,
            description: item.snippet.description
        }));

    } catch (error) {
        console.error("YouTube API Error:", error);
        throw error;
    }
};

export const getPopularVideos = async () => {
    if (!API_KEY) {
        throw new Error("Clé API YouTube manquante.");
    }

    try {
        const url = new URL(`${BASE_URL}/videos`);
        url.searchParams.append("part", "snippet");
        url.searchParams.append("chart", "mostPopular");
        url.searchParams.append("regionCode", "FR"); // Optional: target region
        url.searchParams.append("maxResults", "12");
        url.searchParams.append("key", API_KEY);

        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || "Erreur lors de la récupération des vidéos populaires");
        }

        const data = await response.json();

        return data.items.map(item => ({
            id: item.id, // for /videos endpoint, id is a string, not object
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url || item.snippet.thumbnails.medium.url,
            channelTitle: item.snippet.channelTitle,
            description: item.snippet.description
        }));
    } catch (error) {
        console.error("YouTube API Popular Error:", error);
        throw error;
    }
};
