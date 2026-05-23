// utils/validate.js — Input validation helpers
// Same throw-based pattern as DevTinder's validate.js

// ─── Board Validation ─────────────────────────────────────────

function validateBoardData(body) {
  const { title } = body;

  if (!title?.trim()) {
    throw new Error("Board title is required");
  }
  if (title.length > 100) {
    throw new Error("Board title must be under 100 characters");
  }

  // validate background color if provided
  if (body.backgroundColor && !/^#[0-9A-Fa-f]{6}$/.test(body.backgroundColor)) {
    throw new Error("Invalid background color format (use hex e.g. #0079BF)");
  }
}

// ─── List Validation ──────────────────────────────────────────

function validateListData(body) {
  const { title } = body;

  if (!title?.trim()) {
    throw new Error("List title is required");
  }
  if (title.length > 100) {
    throw new Error("List title must be under 100 characters");
  }
}

// ─── Card Validation ──────────────────────────────────────────

function validateCardData(body) {
  const { title } = body;

  if (!title?.trim()) {
    throw new Error("Card title is required");
  }
  if (title.length > 200) {
    throw new Error("Card title must be under 200 characters");
  }

  // validate due date if provided
  if (body.dueDate && isNaN(new Date(body.dueDate).getTime())) {
    throw new Error("Invalid due date format");
  }

  // validate cover color if provided
  if (body.coverColor && !/^#[0-9A-Fa-f]{6}$/.test(body.coverColor)) {
    throw new Error("Invalid cover color format (use hex e.g. #FF5733)");
  }
}

// ─── Card Update Validation ───────────────────────────────────

function validateCardUpdateData(body) {
  const allowedFields = [
    "title",
    "description",
    "dueDate",
    "coverImage",
    "coverColor",
    "isArchived",
    "isComplete",
    "position",
    "listId",
  ];

  const requestedFields = Object.keys(body);
  const isAllowed = requestedFields.every((field) =>
    allowedFields.includes(field)
  );

  if (!isAllowed) {
    throw new Error(
      "Invalid update request: One or more fields are not editable"
    );
  }

  if (body.title !== undefined && !body.title?.trim()) {
    throw new Error("Card title cannot be empty");
  }
  if (body.title && body.title.length > 200) {
    throw new Error("Card title must be under 200 characters");
  }
  if (body.dueDate && isNaN(new Date(body.dueDate).getTime())) {
    throw new Error("Invalid due date format");
  }
  if (body.coverColor && !/^#[0-9A-Fa-f]{6}$/.test(body.coverColor)) {
    throw new Error("Invalid cover color format");
  }
}

// ─── Comment Validation ───────────────────────────────────────

function validateCommentData(body) {
  const { text } = body;

  if (!text?.trim()) {
    throw new Error("Comment text is required");
  }
  if (text.length > 5000) {
    throw new Error("Comment must be under 5000 characters");
  }
}

// ─── Checklist Validation ─────────────────────────────────────

function validateChecklistData(body) {
  const { title } = body;

  if (!title?.trim()) {
    throw new Error("Checklist title is required");
  }
  if (title.length > 200) {
    throw new Error("Checklist title must be under 200 characters");
  }
}

function validateChecklistItemData(body) {
  const { text } = body;

  if (!text?.trim()) {
    throw new Error("Checklist item text is required");
  }
  if (text.length > 500) {
    throw new Error("Checklist item must be under 500 characters");
  }
}

module.exports = {
  validateBoardData,
  validateListData,
  validateCardData,
  validateCardUpdateData,
  validateCommentData,
  validateChecklistData,
  validateChecklistItemData,
};
