// routes/checklistRouter.js — Checklist CRUD + ChecklistItem CRUD

const express = require("express");
const checklistRouter = express.Router();
const dbConnect = require("../config/dbConnect");
const {
  validateChecklistData,
  validateChecklistItemData,
} = require("../utils/validate");

const prisma = dbConnect();

// POST /cards/:cardId/checklists — Create a checklist on a card
checklistRouter.post("/cards/:cardId/checklists", async (req, res) => {
  try {
    const { cardId } = req.params;
    const { title } = req.body;

    validateChecklistData(req.body);

    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) {
      return res
        .status(404)
        .json({ message: "Checklist creation failed", error: "Card not found" });
    }

    // get position for new checklist
    const lastChecklist = await prisma.checklist.findFirst({
      where: { cardId },
      orderBy: { position: "desc" },
    });
    const position = lastChecklist ? lastChecklist.position + 1000 : 1000;

    const checklist = await prisma.checklist.create({
      data: {
        title: title.trim(),
        position,
        cardId,
      },
      include: { items: true },
    });

    res
      .status(201)
      .json({ message: "Checklist created successfully", data: checklist });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Checklist creation failed", error: err.message });
  }
});

// PUT /checklists/:id — Update checklist title
checklistRouter.put("/checklists/:id", async (req, res) => {
  try {
    const { title } = req.body;

    if (title !== undefined) {
      validateChecklistData(req.body);
    }

    const checklist = await prisma.checklist.update({
      where: { id: req.params.id },
      data: { title: title.trim() },
      include: { items: { orderBy: { position: "asc" } } },
    });

    res
      .status(200)
      .json({ message: "Checklist updated successfully", data: checklist });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Checklist update failed", error: "Checklist not found" });
    }
    res
      .status(400)
      .json({ message: "Checklist update failed", error: err.message });
  }
});

// DELETE /checklists/:id — Delete a checklist
checklistRouter.delete("/checklists/:id", async (req, res) => {
  try {
    await prisma.checklist.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ message: "Checklist deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Checklist deletion failed", error: "Checklist not found" });
    }
    res
      .status(400)
      .json({ message: "Checklist deletion failed", error: err.message });
  }
});

// ─── Checklist Items ──────────────────────────────────────────

// POST /checklists/:id/items — Add item to a checklist
checklistRouter.post("/checklists/:id/items", async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    validateChecklistItemData(req.body);

    const checklist = await prisma.checklist.findUnique({ where: { id } });
    if (!checklist) {
      return res
        .status(404)
        .json({ message: "Adding item failed", error: "Checklist not found" });
    }

    // get position for new item
    const lastItem = await prisma.checklistItem.findFirst({
      where: { checklistId: id },
      orderBy: { position: "desc" },
    });
    const position = lastItem ? lastItem.position + 1000 : 1000;

    const item = await prisma.checklistItem.create({
      data: {
        text: text.trim(),
        position,
        checklistId: id,
      },
    });

    res
      .status(201)
      .json({ message: "Checklist item added successfully", data: item });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Adding checklist item failed", error: err.message });
  }
});

// PUT /checklist-items/:id — Toggle item completion / update text
checklistRouter.put("/checklist-items/:id", async (req, res) => {
  try {
    const { text, isCompleted } = req.body;

    if (text !== undefined) {
      validateChecklistItemData(req.body);
    }

    const item = await prisma.checklistItem.update({
      where: { id: req.params.id },
      data: {
        ...(text !== undefined && { text: text.trim() }),
        ...(isCompleted !== undefined && { isCompleted }),
      },
    });

    res
      .status(200)
      .json({ message: "Checklist item updated successfully", data: item });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Checklist item update failed", error: "Item not found" });
    }
    res
      .status(400)
      .json({ message: "Checklist item update failed", error: err.message });
  }
});

// DELETE /checklist-items/:id — Delete a checklist item
checklistRouter.delete("/checklist-items/:id", async (req, res) => {
  try {
    await prisma.checklistItem.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ message: "Checklist item deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Checklist item deletion failed", error: "Item not found" });
    }
    res
      .status(400)
      .json({ message: "Checklist item deletion failed", error: err.message });
  }
});

module.exports = checklistRouter;
