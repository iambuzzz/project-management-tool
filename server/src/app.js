const express = require("express");
const cors = require("cors");
const path = require("path");
const dbConnect = require("./config/dbConnect");
require("dotenv").config();

const { notFoundHandler, globalErrorHandler } = require("./middlewares/errorHandler");

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

const start = async () => {
  try {
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


app.use("/", boardRouter);
app.use("/", listRouter);
app.use("/", cardRouter);
app.use("/", labelRouter);
app.use("/", memberRouter);
app.use("/", checklistRouter);
app.use("/", commentRouter);
app.use("/", attachmentRouter);
app.use("/", searchRouter);

app.use(notFoundHandler);
app.use(globalErrorHandler);

start();
