// routes/commentRouter.js — Comments on cards + Activity log

const express = require("express");
const commentRouter = express.Router();
const dbConnect = require("../config/dbConnect");
const { validateCommentData } = require("../utils/validate");

const prisma = dbConnect();

// GET /cards/:cardId/comments — Get all comments for a card
commentRouter.get("/cards/:cardId/comments", async (req, res) => {
  try {
    const { cardId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { cardId },
      orderBy: { createdAt: "desc" },
      include: { member: true },
    });

    res
      .status(200)
      .json({ message: "Comments fetched successfully", data: comments });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Fetching comments failed", error: err.message });
  }
});

// POST /cards/:cardId/comments — Add a comment to a card
commentRouter.post("/cards/:cardId/comments", async (req, res) => {
  try {
    const { cardId } = req.params;
    const { text, memberId } = req.body;

    validateCommentData(req.body);

    if (!memberId) {
      throw new Error("memberId is required");
    }

    // check if card exists
    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) {
      return res
        .status(404)
        .json({ message: "Adding comment failed", error: "Card not found" });
    }

    // check if member exists
    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) {
      return res
        .status(404)
        .json({ message: "Adding comment failed", error: "Member not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        cardId,
        memberId,
      },
      include: { member: true },
    });

    // also create an activity log entry
    await prisma.activity.create({
      data: {
        action: "added a comment",
        entityType: "comment",
        entityId: comment.id,
        cardId,
        memberId,
        metadata: { commentText: text.trim().substring(0, 100) },
      },
    });

    res
      .status(201)
      .json({ message: "Comment added successfully", data: comment });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Adding comment failed", error: err.message });
  }
});

// PUT /comments/:id — Edit a comment
commentRouter.put("/comments/:id", async (req, res) => {
  try {
    const { text } = req.body;

    validateCommentData(req.body);

    const comment = await prisma.comment.update({
      where: { id: req.params.id },
      data: { text: text.trim() },
      include: { member: true },
    });

    res
      .status(200)
      .json({ message: "Comment updated successfully", data: comment });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Comment update failed", error: "Comment not found" });
    }
    res
      .status(400)
      .json({ message: "Comment update failed", error: err.message });
  }
});

// DELETE /comments/:id — Delete a comment
commentRouter.delete("/comments/:id", async (req, res) => {
  try {
    await prisma.comment.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Comment deletion failed", error: "Comment not found" });
    }
    res
      .status(400)
      .json({ message: "Comment deletion failed", error: err.message });
  }
});

// ─── Activity Log ─────────────────────────────────────────────

// GET /cards/:cardId/activities — Get activity log for a card
commentRouter.get("/cards/:cardId/activities", async (req, res) => {
  try {
    const { cardId } = req.params;

    const activities = await prisma.activity.findMany({
      where: { cardId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { member: true },
    });

    res
      .status(200)
      .json({ message: "Activities fetched successfully", data: activities });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Fetching activities failed", error: err.message });
  }
});

module.exports = commentRouter;
