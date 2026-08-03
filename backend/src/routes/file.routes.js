import express from "express";
import {
  uploadConvertedFile,
  downloadFile,
} from "../controllers/file.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/upload", upload.single("convertedFile"), uploadConvertedFile);
router.get("/download/:fileId", downloadFile);

export default router;
