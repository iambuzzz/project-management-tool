// routes/boardRouter.js — Board CRUD

const express = require("express");
const boardRouter = express.Router();
const dbConnect = require("../config/dbConnect");
const { validateBoardData } = require("../utils/validate");

const prisma = dbConnect();

// GET /boards — List all boards
boardRouter.get("/boards", async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        lists: {
          where: { isArchived: false },
          orderBy: { position: "asc" },
          include: {
            cards: {
              where: { isArchived: false },
              orderBy: { position: "asc" },
              select: { id: true },
            },
          },
        },
      },
    });

    res
      .status(200)
      .json({ message: "Boards fetched successfully", data: boards });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Fetching boards failed", error: err.message });
  }
});

// POST /boards — Create a new board
boardRouter.post("/boards", async (req, res) => {
  try {
    const { title, backgroundColor, backgroundImage } = req.body;

    validateBoardData(req.body);

    const board = await prisma.board.create({
      data: {
        title: title.trim(),
        backgroundColor: backgroundColor || "#0079BF",
        backgroundImage: backgroundImage || null,
      },
    });

    res
      .status(201)
      .json({ message: "Board created successfully", data: board });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Board creation failed", error: err.message });
  }
});

boardRouter.get("/boards/:id", async (req, res) => {
  try {
    const board = await prisma.board.findUnique({
      where: { id: req.params.id },
      include: {
        lists: {
          where: { isArchived: false },
          orderBy: { position: "asc" },
          include: {
            cards: {
              where: { isArchived: false },
              orderBy: { position: "asc" },
              include: {
                labels: { include: { label: true } },
                members: { include: { member: true } },
                checklists: {
                  include: { items: { orderBy: { position: "asc" } } },
                },
                _count: {
                  select: { comments: true, attachments: true },
                },
              },
            },
          },
        },
      },
    });

    if (!board) {
      return res
        .status(404)
        .json({ message: "Board fetch failed", error: "Board not found" });
    }

    res
      .status(200)
      .json({ message: "Board fetched successfully", data: board });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Fetching board failed", error: err.message });
  }
});

// PUT /boards/:id — Update board (title, background)
boardRouter.put("/boards/:id", async (req, res) => {
  try {
    const { title, backgroundColor, backgroundImage } = req.body;

    if (title !== undefined) {
      validateBoardData(req.body);
    }

    const board = await prisma.board.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(backgroundColor !== undefined && { backgroundColor }),
        ...(backgroundImage !== undefined && { backgroundImage }),
      },
    });

    res
      .status(200)
      .json({ message: "Board updated successfully", data: board });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Board update failed", error: "Board not found" });
    }
    res
      .status(400)
      .json({ message: "Board update failed", error: err.message });
  }
});

// DELETE /boards/:id — Delete a board
boardRouter.delete("/boards/:id", async (req, res) => {
  try {
    await prisma.board.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ message: "Board deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Board deletion failed", error: "Board not found" });
    }
    res
      .status(400)
      .json({ message: "Board deletion failed", error: err.message });
  }
});

module.exports = boardRouter;
