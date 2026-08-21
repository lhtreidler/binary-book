import "dotenv/config";
import express from "express";
import cors from "cors";
import { routes } from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
for (const [path, router] of routes) {
  app.use(path, router);
}

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// // Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response) => {
  console.error(err.stack);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
