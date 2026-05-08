import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRoutes, bookRoutes, rankingRoutes } from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// app.use((req: express.Request, _res: express.Response, next) => {
//   console.log(req.method, req.path, req.body);
//   next();
// });

// Routes
app.use("/auth", authRoutes);
app.use("/ranking", rankingRoutes);
app.use("/books", bookRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// // Error handling middleware
// app.use((err: any, _req: express.Request, res: express.Response) => {
//   console.error(err.stack);
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
