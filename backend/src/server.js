import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { verifyConnection } from "./db/driver.js";
import { errorHandler } from "./middleware/errorHandler.js";
import customersRouter from "./routes/customers.js";
import restaurantsRouter from "./routes/restaurants.js";
import graphRouter from "./routes/graph.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  const connected = await verifyConnection();
  res.status(connected ? 200 : 503).json({ connected });
});

app.use("/api/customers", customersRouter);
app.use("/api/restaurants", restaurantsRouter);
app.use("/api/graph", graphRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

verifyConnection().then(() => {
  app.listen(PORT, () => console.log(`[server] Listening on port ${PORT}`));
});
