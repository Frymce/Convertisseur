import { storeFile, getFile } from "../services/file.service.js";

export const uploadConvertedFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const fileInfo = await storeFile(req.file.path, req.file.originalname);

    res.json({
      success: true,
      fileId: fileInfo.fileId,
      downloadUrl: `/download/${fileInfo.fileId}`,
      expiresAt: fileInfo.expiresAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await getFile(fileId);

    res.download(file.path, file.name, async (err) => {
      if (err) {
        res.status(404).json({ error: err });
      }
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
