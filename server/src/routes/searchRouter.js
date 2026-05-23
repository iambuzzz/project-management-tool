// routes/searchRouter.js — Search & Filter cards within a board

const express = require("express");
const searchRouter = express.Router();
const dbConnect = require("../config/dbConnect");

const prisma = dbConnect();

// GET /boards/:boardId/search?q=...&labels=...&members=...&dueDate=...
// Search and filter cards within a board
searchRouter.get("/boards/:boardId/search", async (req, res) => {
  try {
    const { boardId } = req.params;
    const { q, labels, members, dueDate } = req.query;

    // check if board exists
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      return res
        .status(404)
        .json({ message: "Search failed", error: "Board not found" });
    }

    // build where clause
    const whereClause = {
      isArchived: false,
      list: {
        boardId,
        isArchived: false,
      },
    };

    // search by title (case-insensitive)
    if (q) {
      whereClause.title = {
        contains: q,
        mode: "insensitive",
      };
    }

    // filter by labels (comma-separated label IDs)
    if (labels) {
      const labelIds = labels.split(",").map((id) => id.trim());
      whereClause.labels = {
        some: {
          labelId: { in: labelIds },
        },
      };
    }

    // filter by members (comma-separated member IDs)
    if (members) {
      const memberIds = members.split(",").map((id) => id.trim());
      whereClause.members = {
        some: {
          memberId: { in: memberIds },
        },
      };
    }

    // filter by due date
    if (dueDate) {
      const now = new Date();
      switch (dueDate) {
        case "overdue":
          whereClause.dueDate = { lt: now };
          break;
        case "today":
          const todayStart = new Date(now.setHours(0, 0, 0, 0));
          const todayEnd = new Date(now.setHours(23, 59, 59, 999));
          whereClause.dueDate = { gte: todayStart, lte: todayEnd };
          break;
        case "week":
          const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          whereClause.dueDate = { gte: now, lte: weekEnd };
          break;
        case "none":
          whereClause.dueDate = null;
          break;
        default:
          break;
      }
    }

    const cards = await prisma.card.findMany({
      where: whereClause,
      orderBy: { position: "asc" },
      include: {
        list: { select: { id: true, title: true } },
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklists: {
          include: { items: true },
        },
        _count: { select: { comments: true, attachments: true } },
      },
    });

    res
      .status(200)
      .json({ message: `Found ${cards.length} cards`, data: cards });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Search failed", error: err.message });
  }
});

// GET /search?q=...
// Global search across all boards
searchRouter.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(200).json({ message: "Query too short", data: [] });
    }

    const cards = await prisma.card.findMany({
      where: {
        isArchived: false,
        title: {
          contains: q,
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        list: {
          include: { board: true },
        },
      },
      take: 20, // limit global search results
    });

    res.status(200).json({ message: `Found ${cards.length} cards`, data: cards });
  } catch (err) {
    res.status(400).json({ message: "Global search failed", error: err.message });
  }
});

module.exports = searchRouter;
