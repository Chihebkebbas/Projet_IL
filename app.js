import express from "express";
import cors from "cors";

import roomRoutes from "./routes/roomRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Routes REST
app.use("/rooms", roomRoutes);

export default app;
