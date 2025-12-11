
const Salon = require("../models/Salon");
const Video = require("../models/Video");

/**
 * GET /api/salons/:salonId/playlist
 */
exports.getPlaylist = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.salonId).populate("playlist");

    if (!salon) {
      return res.status(404).json({ message: "Salon introuvable" });
    }

    res.json(salon.playlist);
  } catch (err) {
    console.error("getPlaylist error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * POST /api/salons/:salonId/playlist
 */
exports.addVideo = async (req, res) => 
{
  try {
    const { youtubeId, titre, miniature, duree } = req.body;

    const salon = await Salon.findById(req.params.salonId);
    if (!salon) {
      return res.status(404).json({ message: "Salon introuvable" });
    }

    const video = await Video.create({ youtubeId, titre, miniature, duree });

    salon.playlist.push(video._id);
    await salon.save();

    res.status(201).json(video);
  } catch (err) {
    console.error("addVideo error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


/**
 * DELETE /api/salons/:salonId/playlist/:videoId
 */
exports.removeVideo = async (req, res) => {
  try {
    const { salonId, videoId } = req.params;

    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ message: "Salon introuvable" });
    }

    salon.playlist.pull(videoId);
    await salon.save();

    await Video.findByIdAndDelete(videoId);

    res.json({ message: "Vidéo supprimée de la playlist" });
  } catch (err) {
    console.error("removeVideo error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
