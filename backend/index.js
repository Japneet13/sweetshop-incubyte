// index.js
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models/index");
const authRoutes = require("./routes/auth");
const sweetsRoutes = require("./routes/sweets");

const app = express();

/* CORS */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/* JSON body parser */
app.use(express.json({ limit: "100kb" }));

/**
 * Simple request logger
 */
app.use((req, res, next) => {
  console.log(`[REQ] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

/* Routes */
app.use("/api/auth", authRoutes);
app.use("/api/sweets", sweetsRoutes);

/* Health check */
app.get("/", (req, res) => res.json({ status: "ok" }));

/**
 * JSON parse error handler
 */
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.warn("[JSON PARSE ERROR]", req.method, req.originalUrl);
    return res.status(400).json({ message: "Malformed JSON in request body" });
  }
  next(err);
});

/* ---- SERVER START (only if not testing) ---- */
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  (async () => {
    try {
      await sequelize.sync();
      app.listen(PORT, () => {
        console.log(`Server started on http://localhost:${PORT}`);
      });
    } catch (err) {
      console.error("Failed to start server:", err);
    }
  })();
}

/* Export app for testing */
module.exports = app;
