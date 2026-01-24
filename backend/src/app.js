import express from "express";
import cors from "cors";
import reviewRoutes from "./routes/review.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Backend running" });
});

app.use("/api/review", reviewRoutes);

export default app;
