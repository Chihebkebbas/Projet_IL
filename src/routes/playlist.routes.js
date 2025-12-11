// src/routes/playlist.routes.js
const express = require("express");
const router = express.Router();

const {
  getPlaylist,
  addVideo,
  removeVideo,
} = require("../controllers/playlist.controller");

// /api/salons/:salonId/playlist
router.get("/:salonId/playlist", getPlaylist);
router.post("/:salonId/playlist", addVideo);
router.delete("/:salonId/playlist/:videoId", removeVideo);

module.exports = router;
