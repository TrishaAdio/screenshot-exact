/**
 * SymDeals backend entrypoint.
 *
 * Run on a VPS:
 *   cd backend
 *   cp .env.example .env   # edit values
 *   npm install
 *   node server.js
 *
 * If MONGODB_URI is empty, the process prompts for it interactively.
 */
require("dotenv").config();

const path = require("path");
const readline = require("readline");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { connectDB } = require("./config/db");
const { uploadsDir } = require("./middleware/upload");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/user");
const paymentRoutes = require("./routes/payments");
const orderRoutes = require("./routes/orders");
const noticeRoutes = require("./routes/notices");

function getTrustProxySetting() {
  const value = (process.env.TRUST_PROXY || "1").trim();
  if (value === "true") return true;
  if (value === "false") return false;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric;
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function getMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  if (!process.stdin.isTTY) {
    console.error(
      "MONGODB_URI is not set and no interactive terminal is available."
    );
    process.exit(1);
  }
  const uri = await prompt("Enter MongoDB URI: ");
  if (!uri) {
    console.error("MongoDB URI is required. Exiting.");
    process.exit(1);
  }
  process.env.MONGODB_URI = uri;
  return uri;
}

function buildApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", getTrustProxySetting());
  // Allow cross-origin image loads from /uploads (frontend may live on another origin).
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(express.json({ limit: "100kb" }));

  // Serve uploaded images publicly with long cache.
  app.use(
    "/uploads",
    express.static(uploadsDir, {
      maxAge: "7d",
      fallthrough: true,
      index: false,
    })
  );

  const originEnv = (process.env.CORS_ORIGIN || "*").trim();
  const corsOptions =
    originEnv === "*"
      ? { origin: true }
      : {
          origin: originEnv.split(",").map((s) => s.trim()).filter(Boolean),
          credentials: true,
        };
  app.use(cors(corsOptions));

  if (process.env.NODE_ENV !== "test") app.use(morgan("tiny"));

  app.get("/health", (_req, res) =>
    res.json({ success: true, status: "ok", uptime: process.uptime() })
  );

  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/orders", orderRoutes);

  app.use((_req, res) =>
    res.status(404).json({ success: false, message: "Not found" })
  );

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error("[error]", err);
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message || "Server error" });
  });

  return app;
}

async function start() {
  try {
    const uri = await getMongoUri();
    await connectDB(uri);

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
      console.warn(
        "⚠  JWT_SECRET is missing or weak. Set a long random string in .env."
      );
    }

    const app = buildApp();
    const port = Number(process.env.PORT) || 5000;
    app.listen(port, () => {
      console.log(`✓ SymDeals API listening on http://localhost:${port}`);
      console.log("  POST /api/auth/signup");
      console.log("  POST /api/auth/login");
      console.log("  GET  /api/auth/me   (Bearer token)");
      console.log("  POST /api/admin/login");
      console.log("  GET  /api/admin/stats/today  (Admin Bearer token)");
      console.log("  GET  /api/products");
      console.log("  POST /api/admin/products       (Admin Bearer token)");
      console.log("  DELETE /api/admin/products/:id (Admin Bearer token)");
      console.log("  GET  /health");
    });
  } catch (err) {
    console.error("Failed to start server:", err.message || err);
    process.exit(1);
  }
}

start();
