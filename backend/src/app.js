import express from "express";
import cors from "cors";
import fileRoutes from "./routes/file.routes.js";
import { initStorage, startCleanupInterval } from "./services/file.service.js";

const app = express();
const PORT = process.env.PORT || 5000;

// En production, restreindre CORS à l'origine du frontend.
// En développement, autoriser toutes les origines.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

const corsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origine (ex: curl, Postman) en développement
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/", fileRoutes);

const startServer = async () => {
  await initStorage();
  startCleanupInterval();

  app.listen(PORT);
};

startServer();
