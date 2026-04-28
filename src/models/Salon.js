
const mongoose = require("mongoose");

const etatLecteurSchema = new mongoose.Schema(
  {
    videoId: { type: String },          
    timestamp: { type: Number, default: 0 },
    pause: { type: Boolean, default: true },
  },
  { _id: false }
);

const salonSchema = new mongoose.Schema(
  {
    codeAcces: { type: String, required: true, unique: true },
    nom: { type: String },
    dateCreation: { type: Date, default: Date.now },

  
    playlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],

    etatLecteur: { type: etatLecteurSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salon", salonSchema);
