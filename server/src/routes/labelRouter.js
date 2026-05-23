// routes/labelRouter.js — Label management + Card-Label assignment

const express = require("express");
const labelRouter = express.Router();
const dbConnect = require("../config/dbConnect");

const prisma = dbConnect();

// GET /labels — List all available labels
labelRouter.get("/labels", async (req, res) => {
  try {
    const labels = await prisma.label.findMany({
      orderBy: { color: "asc" },
    });

    res
      .status(200)
      .json({ message: "Labels fetched successfully", data: labels });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Fetching labels failed", error: err.message });
  }
});

// POST /cards/:cardId/labels — Add a label to a card
labelRouter.post("/cards/:cardId/labels", async (req, res) => {
  try {
    const { cardId } = req.params;
    const { labelId } = req.body;

    if (!labelId) {
      throw new Error("labelId is required");
    }

    // check if card and label exist
    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) {
      return res
        .status(404)
        .json({ message: "Adding label failed", error: "Card not found" });
    }

    const label = await prisma.label.findUnique({ where: { id: labelId } });
    if (!label) {
      return res
        .status(404)
        .json({ message: "Adding label failed", error: "Label not found" });
    }

    // check if already assigned
    const existing = await prisma.cardLabel.findUnique({
      where: { cardId_labelId: { cardId, labelId } },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Adding label failed", error: "Label already assigned to this card" });
    }

    const cardLabel = await prisma.cardLabel.create({
      data: { cardId, labelId },
      include: { label: true },
    });

    res
      .status(201)
      .json({ message: "Label added to card successfully", data: cardLabel });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Adding label failed", error: err.message });
  }
});

// DELETE /cards/:cardId/labels/:labelId — Remove a label from a card
labelRouter.delete("/cards/:cardId/labels/:labelId", async (req, res) => {
  try {
    const { cardId, labelId } = req.params;

    await prisma.cardLabel.delete({
      where: { cardId_labelId: { cardId, labelId } },
    });

    res.status(200).json({ message: "Label removed from card successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Removing label failed", error: "Label not found on this card" });
    }
    res
      .status(400)
      .json({ message: "Removing label failed", error: err.message });
  }
});

module.exports = labelRouter;
