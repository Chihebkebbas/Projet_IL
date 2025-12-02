import express from "express";
import { handleCreateRoom, handleJoinRoom } from "../controllers/roomController.js";

const router = express.Router();

router.post("/create", handleCreateRoom);
router.post("/join", handleJoinRoom);

export default router;
