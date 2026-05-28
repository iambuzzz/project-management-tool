// routes/listRouter.js — List CRUD + Reorder

const express = require("express");
const listRouter = express.Router();
const dbConnect = require("../config/dbConnect");
const { validateListData } = require("../utils/validate");

const prisma = dbConnect();

// POST /boards/:boardId/lists — Create a list in a board
listRouter.post("/boards/:boardId/lists", async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;

    validateListData(req.body);

    // check if board exists
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      return res
        .status(404)
        .json({ message: "List creation failed", error: "Board not found" });
    }

    // get highest position to place new list at end
    const lastList = await prisma.list.findFirst({
      where: { boardId, isArchived: false },
      orderBy: { position: "desc" },
    });

    const position = lastList ? lastList.position + 1000 : 1000;

    const list = await prisma.list.create({
      data: {
        title: title.trim(),
        position,
        boardId,
      },
      include: {
        cards: true,
      },
    });

    res
      .status(201)
      .json({ message: "List created successfully", data: list });
  } catch (err) {
    res
      .status(400)
      .json({ message: "List creation failed", error: err.message });
  }
});

// PUT /lists/reorder — Batch reorder lists (drag-and-drop)
listRouter.put("/lists/reorder", async (req, res) => {
  try {
    const { orderedLists } = req.body;
    // orderedLists = [{ id: "uuid", position: 1000 }, { id: "uuid", position: 2000 }, ...]

    if (!Array.isArray(orderedLists) || orderedLists.length === 0) {
      throw new Error("orderedLists array is required");
    }

    // batch update all positions in a transaction
    const updates = orderedLists.map((item) =>
      prisma.list.update({
        where: { id: item.id },
        data: { position: item.position },
      })
    );

    await prisma.$transaction(updates);

    res.status(200).json({ message: "Lists reordered successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "List reorder failed", error: err.message });
  }
});

// PUT /lists/:id — Update list title
listRouter.put("/lists/:id", async (req, res) => {
  try {
    const { title } = req.body;

    if (title !== undefined) {
      validateListData(req.body);
    }

    const list = await prisma.list.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
      },
    });

    res
      .status(200)
      .json({ message: "List updated successfully", data: list });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "List update failed", error: "List not found" });
    }
    res
      .status(400)
      .json({ message: "List update failed", error: err.message });
  }
});

// PUT /lists/reorder removed from here (moved above)

// DELETE /lists/:id — Archive/delete a list
listRouter.delete("/lists/:id", async (req, res) => {
  try {
    // soft delete (archive)
    await prisma.list.update({
      where: { id: req.params.id },
      data: { isArchived: true },
    });

    res.status(200).json({ message: "List archived successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "List deletion failed", error: "List not found" });
    }
    res
      .status(400)
      .json({ message: "List deletion failed", error: err.message });
  }
});

module.exports = listRouter;
