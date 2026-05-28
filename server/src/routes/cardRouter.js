// routes/cardRouter.js — Card CRUD + Move + Reorder

const express = require("express");
const cardRouter = express.Router();
const dbConnect = require("../config/dbConnect");
const { validateCardData, validateCardUpdateData } = require("../utils/validate");

const prisma = dbConnect();

// POST /lists/:listId/cards — Create a card in a list
cardRouter.post("/lists/:listId/cards", async (req, res) => {
  try {
    const { listId } = req.params;
    const { title } = req.body;

    validateCardData(req.body);

    // check if list exists
    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list) {
      return res
        .status(404)
        .json({ message: "Card creation failed", error: "List not found" });
    }

    // get highest position to place new card at bottom
    const lastCard = await prisma.card.findFirst({
      where: { listId, isArchived: false },
      orderBy: { position: "desc" },
    });

    const position = lastCard ? lastCard.position + 1000 : 1000;

    const card = await prisma.card.create({
      data: {
        title: title.trim(),
        position,
        listId,
      },
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklists: {
          include: { items: { orderBy: { position: "asc" } } },
        },
        _count: { select: { comments: true, attachments: true } },
      },
    });

    res
      .status(201)
      .json({ message: "Card created successfully", data: card });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Card creation failed", error: err.message });
  }
});

// GET /cards/:id — Get card with full details
cardRouter.get("/cards/:id", async (req, res) => {
  try {
    const card = await prisma.card.findUnique({
      where: { id: req.params.id },
      include: {
        list: { select: { id: true, title: true, boardId: true } },
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklists: {
          orderBy: { position: "asc" },
          include: {
            items: { orderBy: { position: "asc" } },
          },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          include: { member: true },
        },
        attachments: {
          orderBy: { createdAt: "desc" },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { member: true },
        },
      },
    });

    if (!card) {
      return res
        .status(404)
        .json({ message: "Card fetch failed", error: "Card not found" });
    }

    res
      .status(200)
      .json({ message: "Card fetched successfully", data: card });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Fetching card failed", error: err.message });
  }
});

// GET /boards/:boardId/cards/archived — Get all archived cards for a board
cardRouter.get("/boards/:boardId/cards/archived", async (req, res) => {
  try {
    const { boardId } = req.params;
    const archivedCards = await prisma.card.findMany({
      where: {
        isArchived: true,
        list: { boardId },
      },
      include: {
        list: { select: { title: true } },
        labels: { include: { label: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.status(200).json({ message: "Archived cards fetched", data: archivedCards });
  } catch (err) {
    res.status(400).json({ message: "Fetch failed", error: err.message });
  }
});

// PUT /cards/reorder — Batch reorder cards (drag-and-drop)
cardRouter.put("/cards/reorder", async (req, res) => {
  try {
    const { orderedCards } = req.body;
    // orderedCards = [{ id: "uuid", position: 1000, listId: "uuid" }, ...]

    if (!Array.isArray(orderedCards) || orderedCards.length === 0) {
      throw new Error("orderedCards array is required");
    }

    const updates = orderedCards.map((item) =>
      prisma.card.update({
        where: { id: item.id },
        data: {
          position: item.position,
          ...(item.listId && { listId: item.listId }),
        },
      })
    );

    await prisma.$transaction(updates);

    res.status(200).json({ message: "Cards reordered successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Card reorder failed", error: err.message });
  }
});

// PUT /cards/:id — Update card (title, description, due date, cover, etc.)
cardRouter.put("/cards/:id", async (req, res) => {
  try {
    if (!Object.keys(req.body).length) {
      return res
        .status(400)
        .json({ message: "Card update failed", error: "Nothing to update" });
    }

    validateCardUpdateData(req.body);

    const existingCard = await prisma.card.findUnique({
      where: { id: req.params.id },
    });

    if (!existingCard) {
      return res
        .status(404)
        .json({ message: "Card update failed", error: "Card not found" });
    }

    let newPosition = existingCard.position;

    // When unarchiving, move to the bottom of the list
    if (existingCard.isArchived && req.body.isArchived === false) {
      const lastCard = await prisma.card.findFirst({
        where: { listId: existingCard.listId, isArchived: false },
        orderBy: { position: "desc" },
      });
      newPosition = lastCard ? lastCard.position + 1000 : 1000;
    }

    const card = await prisma.card.update({
      where: { id: req.params.id },
      data: {
        position: newPosition,
        ...(req.body.title !== undefined && { title: req.body.title.trim() }),
        ...(req.body.description !== undefined && {
          description: req.body.description,
        }),
        ...(req.body.dueDate !== undefined && {
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        }),
        ...(req.body.coverImage !== undefined && {
          coverImage: req.body.coverImage,
        }),
        ...(req.body.coverColor !== undefined && {
          coverColor: req.body.coverColor,
        }),
        ...(req.body.isArchived !== undefined && {
          isArchived: req.body.isArchived,
        }),
        ...(req.body.isComplete !== undefined && {
          isComplete: req.body.isComplete,
        }),
      },
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklists: {
          include: { items: { orderBy: { position: "asc" } } },
        },
        _count: { select: { comments: true, attachments: true } },
      },
    });

    res
      .status(200)
      .json({ message: "Card updated successfully", data: card });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Card update failed", error: "Card not found" });
    }
    res
      .status(400)
      .json({ message: "Card update failed", error: err.message });
  }
});

// PUT /cards/:id/move — Move card to a different list
cardRouter.put("/cards/:id/move", async (req, res) => {
  try {
    const { listId, position } = req.body;

    if (!listId) {
      throw new Error("Target listId is required");
    }

    // check if target list exists
    const targetList = await prisma.list.findUnique({ where: { id: listId } });
    if (!targetList) {
      return res
        .status(404)
        .json({ message: "Card move failed", error: "Target list not found" });
    }

    const card = await prisma.card.update({
      where: { id: req.params.id },
      data: {
        listId,
        position: position || 1000,
      },
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklists: {
          include: { items: { orderBy: { position: "asc" } } },
        },
        _count: { select: { comments: true, attachments: true } },
      },
    });

    res
      .status(200)
      .json({ message: "Card moved successfully", data: card });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Card move failed", error: "Card not found" });
    }
    res
      .status(400)
      .json({ message: "Card move failed", error: err.message });
  }
});

// PUT /cards/reorder removed from here (moved above)

// PUT /cards/:id/archive — Archive/unarchive a card
cardRouter.put("/cards/:id/archive", async (req, res) => {
  try {
    const { isArchived } = req.body;

    const card = await prisma.card.update({
      where: { id: req.params.id },
      data: { isArchived: isArchived !== undefined ? isArchived : true },
    });

    const action = card.isArchived ? "archived" : "unarchived";
    res.status(200).json({ message: `Card ${action} successfully`, data: card });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Card archive failed", error: "Card not found" });
    }
    res
      .status(400)
      .json({ message: "Card archive failed", error: err.message });
  }
});

// DELETE /cards/:id — Permanently delete a card
cardRouter.delete("/cards/:id", async (req, res) => {
  try {
    await prisma.card.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ message: "Card deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Card deletion failed", error: "Card not found" });
    }
    res
      .status(400)
      .json({ message: "Card deletion failed", error: err.message });
  }
});

module.exports = cardRouter;
