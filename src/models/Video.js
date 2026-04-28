
const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    youtubeId: { type: String, required: true },
    titre: { type: String, required: true },
    miniature: { type: String },    
    duree: { type: Number },        
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);

