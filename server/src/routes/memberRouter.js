// routes/memberRouter.js — Member listing + Card-Member assignment

const express = require("express");
const memberRouter = express.Router();
const dbConnect = require("../config/dbConnect");

const prisma = dbConnect();

// GET /members — List all members
memberRouter.get("/members", async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: { name: "asc" },
    });

    res
      .status(200)
      .json({ message: "Members fetched successfully", data: members });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Fetching members failed", error: err.message });
  }
});

// POST /cards/:cardId/members — Assign a member to a card
memberRouter.post("/cards/:cardId/members", async (req, res) => {
  try {
    const { cardId } = req.params;
    const { memberId } = req.body;

    if (!memberId) {
      throw new Error("memberId is required");
    }

    // check if card and member exist
    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) {
      return res
        .status(404)
        .json({ message: "Assigning member failed", error: "Card not found" });
    }

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) {
      return res
        .status(404)
        .json({ message: "Assigning member failed", error: "Member not found" });
    }

    // check if already assigned
    const existing = await prisma.cardMember.findUnique({
      where: { cardId_memberId: { cardId, memberId } },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Assigning member failed", error: "Member already assigned to this card" });
    }

    const cardMember = await prisma.cardMember.create({
      data: { cardId, memberId },
      include: { member: true },
    });

    res
      .status(201)
      .json({ message: "Member assigned to card successfully", data: cardMember });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Assigning member failed", error: err.message });
  }
});

// DELETE /cards/:cardId/members/:memberId — Remove a member from a card
memberRouter.delete("/cards/:cardId/members/:memberId", async (req, res) => {
  try {
    const { cardId, memberId } = req.params;

    await prisma.cardMember.delete({
      where: { cardId_memberId: { cardId, memberId } },
    });

    res.status(200).json({ message: "Member removed from card successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Removing member failed", error: "Member not found on this card" });
    }
    res
      .status(400)
      .json({ message: "Removing member failed", error: err.message });
  }
});

module.exports = memberRouter;
