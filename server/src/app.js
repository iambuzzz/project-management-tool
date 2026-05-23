// app.js — Express Server Entry Point
// Pattern: Same as DevTinder's app.js
// - require() imports at top
// - middleware setup
// - router mounting (flat, like DevTinder)
// - async start() function
// - global error handlers at bottom

const express = require("express");
const cors = require("cors");
const path = require("path");
const dbConnect = require("./config/dbConnect");
require("dotenv").config();

const { notFoundHandler, globalErrorHandler } = require("./middlewares/errorHandler");

// ─── Import Routers ───────────────────────────────────────────
const boardRouter = require("./routes/boardRouter");
const listRouter = require("./routes/listRouter");
const cardRouter = require("./routes/cardRouter");
const labelRouter = require("./routes/labelRouter");
const memberRouter = require("./routes/memberRouter");
const checklistRouter = require("./routes/checklistRouter");
const commentRouter = require("./routes/commentRouter");
const attachmentRouter = require("./routes/attachmentRouter");
const searchRouter = require("./routes/searchRouter");

const app = express();

// ─── Start Server ─────────────────────────────────────────────
// Same pattern as DevTinder: async start function with DB connection

const start = async () => {
  try {
    // verify DB connection
    const prisma = dbConnect();
    await prisma.$connect();
    console.log("PostgreSQL connected successfully...");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log("Server running on port " + PORT + "...");

      // Minimal self-ping to prevent Render from sleeping
      // Render automatically provides RENDER_EXTERNAL_URL
      const publicUrl = process.env.RENDER_EXTERNAL_URL;
      if (publicUrl) {
        console.log("Self-ping enabled for", publicUrl);
        setInterval(async () => {
          try {
            // Ping our own boards endpoint to keep the server awake
            await fetch(`${publicUrl}/boards`);
            console.log("Self-ping successful");
          } catch (err) {
            console.error("Self-ping failed:", err.message);
          }
        }, 14 * 60 * 1000); // 14 minutes
      }
    });
  } catch (err) {
    console.error("Startup failed", err);
    process.exit(1);
  }
};

// ─── Middleware ────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ─── Mount Routers ────────────────────────────────────────────
// Flat mounting — same pattern as DevTinder's app.use("/", authRouter);

app.use("/", boardRouter);
app.use("/", listRouter);
app.use("/", cardRouter);
app.use("/", labelRouter);
app.use("/", memberRouter);
app.use("/", checklistRouter);
app.use("/", commentRouter);
app.use("/", attachmentRouter);
app.use("/", searchRouter);

// ─── Global Error Handlers ────────────────────────────────────
// Same pattern as DevTinder's bottom-of-file error handlers

app.use(notFoundHandler);
app.use(globalErrorHandler);

start();
