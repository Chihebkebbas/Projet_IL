
const axios = require("axios");

const YT_API_KEY = process.env.YT_API_KEY;

function isoToSeconds(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const h = parseInt(match?.[1] || "0", 10);
  const m = parseInt(match?.[2] || "0", 10);
  const s = parseInt(match?.[3] || "0", 10);
  return h * 3600 + m * 60 + s;
}

/**
 * GET /api/youtube/search?q=mr+bean
 */
exports.searchYouTube = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ message: "Paramètre q manquant" });

    const searchResp = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          key: YT_API_KEY,
          q,
          part: "snippet",
          type: "video",
          maxResults: 10,
        },
      }
    );

    const items = searchResp.data.items || [];
    const ids = items.map((it) => it.id.videoId).join(",");

    if (!ids) return res.json([]);

    const detailsResp = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          key: YT_API_KEY,
          id: ids,
          part: "contentDetails",
        },
      }
    );

    const durationById = {};
    for (const vid of detailsResp.data.items || []) {
      durationById[vid.id] = isoToSeconds(vid.contentDetails.duration);
    }

    const results = items.map((it) => ({
      videoId: it.id.videoId,
      titre: it.snippet.title,
      miniature: it.snippet.thumbnails?.medium?.url,
      duree: durationById[it.id.videoId] || 0,
    }));

    res.json(results);
  } catch (err) {
    console.error("searchYouTube error:", err.response?.data || err.message);
    res.status(500).json({ message: "Erreur serveur YouTube" });
  }
};
