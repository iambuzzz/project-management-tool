// routes/attachmentRouter.js — File upload via AWS S3

const express = require("express");
const attachmentRouter = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const dbConnect = require("../config/dbConnect");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
require("dotenv").config();

const prisma = dbConnect();

// ─── S3 Client Setup ─────────────────────────────────────────

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ─── Multer setup (in-memory storage for S3 upload) ──────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"), false);
    }
  },
});

// POST /cards/:cardId/attachments — Upload file to S3 and save reference
attachmentRouter.post(
  "/cards/:cardId/attachments",
  upload.single("file"),
  async (req, res) => {
    try {
      const { cardId } = req.params;

      if (!req.file) {
        throw new Error("No file provided");
      }

      // check if card exists
      const card = await prisma.card.findUnique({ where: { id: cardId } });
      if (!card) {
        return res
          .status(404)
          .json({ message: "Upload failed", error: "Card not found" });
      }

      // generate unique S3 key
      const fileExtension = req.file.originalname.split(".").pop();
      const s3Key = `attachments/${cardId}/${uuidv4()}.${fileExtension}`;

      // upload to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });

      await s3Client.send(uploadCommand);

      // construct the public URL
      const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

      // save attachment record in DB
      const attachment = await prisma.attachment.create({
        data: {
          filename: req.file.originalname,
          url: fileUrl,
          mimeType: req.file.mimetype,
          size: req.file.size,
          cardId,
        },
      });

      res
        .status(201)
        .json({ message: "File uploaded successfully", data: attachment });
    } catch (err) {
      console.error("Upload error:", err.message);
      res
        .status(400)
        .json({ message: "File upload failed", error: err.message });
    }
  }
);

// DELETE /attachments/:id — Delete an attachment
attachmentRouter.delete("/attachments/:id", async (req, res) => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id },
    });
    if (!attachment) {
      return res
        .status(404)
        .json({ message: "Delete failed", error: "Attachment not found" });
    }

    // extract s3 key from URL
    const urlParts = attachment.url.split(".amazonaws.com/");
    const s3Key = urlParts.length === 2 ? urlParts[1] : null;

    if (s3Key) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
      });
      await s3Client.send(deleteCommand);
    }

    await prisma.attachment.delete({ where: { id: req.params.id } });

    res.status(200).json({ message: "Attachment deleted successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Attachment deletion failed", error: err.message });
  }
});

// POST /boards/:boardId/background — Upload custom background to S3
attachmentRouter.post(
  "/boards/:boardId/background",
  upload.single("file"),
  async (req, res) => {
    try {
      const { boardId } = req.params;

      if (!req.file) {
        throw new Error("No file provided");
      }

      const board = await prisma.board.findUnique({ where: { id: boardId } });
      if (!board) {
        return res
          .status(404)
          .json({ message: "Upload failed", error: "Board not found" });
      }

      // delete old custom background if exists
      if (board.backgroundImage && board.backgroundImage.includes("amazonaws.com")) {
        try {
          const urlParts = board.backgroundImage.split(".amazonaws.com/");
          const oldS3Key = urlParts.length === 2 ? urlParts[1] : null;
          if (oldS3Key && oldS3Key.startsWith("backgrounds/")) {
            const deleteCommand = new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: oldS3Key,
            });
            await s3Client.send(deleteCommand);
          }
        } catch (delErr) {
          console.error("Failed to delete old background", delErr);
        }
      }

      // generate unique S3 key
      const fileExtension = req.file.originalname.split(".").pop();
      const s3Key = `backgrounds/${boardId}/${uuidv4()}.${fileExtension}`;

      // upload to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });

      await s3Client.send(uploadCommand);

      // construct the public URL
      const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

      res
        .status(201)
        .json({ message: "Background uploaded successfully", url: fileUrl });
    } catch (err) {
      res
        .status(400)
        .json({ message: "Background upload failed", error: err.message });
    }
  }
);

module.exports = attachmentRouter;
