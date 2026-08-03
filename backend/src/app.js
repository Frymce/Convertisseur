import express from "express";
import cors from "cors";
import fileRoutes from "./routes/file.routes.js";
import { initStorage, startCleanupInterval } from "./services/file.service.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/", fileRoutes);

const startServer = async () => {
  await initStorage();
  startCleanupInterval();

  app.listen(PORT);
};

startServer();
