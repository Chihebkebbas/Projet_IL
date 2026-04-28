// src/routes/youtube.routes.js
const express = require("express");
const router = express.Router();
const { searchYouTube } = require("../controllers/youtube.controller");

// /api/youtube/search?q=...
router.get("/search", searchYouTube);

module.exports = router;
