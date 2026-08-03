import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_DIR = path.resolve(__dirname, "../../storage");
const EXPIRATION_MINUTES = 30;

export const initStorage = async () => {
  await fs.ensureDir(STORAGE_DIR);
};

export const storeFile = async (filePath, originalName) => {
  const fileId = uuidv4();
  const ext = path.extname(originalName) || ".bin";
  const storedName = `${fileId}${ext}`;
  const storedPath = path.join(STORAGE_DIR, storedName);

  await fs.move(filePath, storedPath);

  return {
    fileId,
    storedName,
    storedPath,
    expiresAt: Date.now() + EXPIRATION_MINUTES * 60 * 1000,
  };
};

export const getFile = async (fileId) => {
  const files = await fs.readdir(STORAGE_DIR);
  const storedFile = files.find((file) => file.startsWith(fileId));

  if (!storedFile) {
    throw new Error("File not found or expired");
  }

  const filePath = path.join(STORAGE_DIR, storedFile);

  return {
    path: filePath,
    name: storedFile,
  };
};

export const deleteExpiredFiles = async () => {
  const now = Date.now();
  const files = await fs.readdir(STORAGE_DIR);

  for (const file of files) {
    const filePath = path.join(STORAGE_DIR, file);
    const stats = await fs.stat(filePath);

    if (now - stats.mtimeMs > EXPIRATION_MINUTES * 60 * 1000) {
      await fs.remove(filePath);
    }
  }
};

export const startCleanupInterval = (intervalMinutes = 10) => {
  setInterval(
    async () => {
      try {
        await deleteExpiredFiles();
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    },
    intervalMinutes * 60 * 1000,
  );
};
