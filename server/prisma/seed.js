// prisma/seed.js — Seed database with sample data
// Assignment requirement: "Seed your database with a sample board, lists, cards, and members"

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Clear existing data ──────────────────────────────────────
  // Order matters: delete from child tables first
  await prisma.activity.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.cardMember.deleteMany();
  await prisma.cardLabel.deleteMany();
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.board.deleteMany();
  await prisma.label.deleteMany();
  await prisma.member.deleteMany();

  console.log("✅ Cleared existing data");

  // ─── Seed Members ─────────────────────────────────────────────
  // "No login required — assume a default user is logged in"
  // "Create sample members for assignment functionality"

  const members = await Promise.all([
    prisma.member.create({
      data: {
        name: "Ambuj Jaiswal",
        email: "ambuj@trello.com",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ambuj",
      },
    }),
    prisma.member.create({
      data: {
        name: "Riya Sharma",
        email: "riya@trello.com",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Riya",
      },
    }),
    prisma.member.create({
      data: {
        name: "Bhavya Jain",
        email: "bhavya@trello.com",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bhavya",
      },
    }),
    prisma.member.create({
      data: {
        name: "Rahul Gupta",
        email: "rahul@trello.com",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
      },
    }),
    prisma.member.create({
      data: {
        name: "Kavita Singh",
        email: "kavita@trello.com",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita",
      },
    }),
  ]);

  const [ambuj, riya, bhavya, rahul, kavita] = members;
  console.log("✅ Created " + members.length + " members");

  // ─── Seed Labels (Trello's default colors) ────────────────────

  const labels = await Promise.all([
    prisma.label.create({ data: { name: "Bug", color: "#EB5A46" } }),
    prisma.label.create({ data: { name: "Feature", color: "#61BD4F" } }),
    prisma.label.create({ data: { name: "Enhancement", color: "#F2D600" } }),
    prisma.label.create({ data: { name: "Urgent", color: "#C377E0" } }),
    prisma.label.create({ data: { name: "Design", color: "#FF9F1A" } }),
    prisma.label.create({ data: { name: "Backend", color: "#0079BF" } }),
    prisma.label.create({ data: { name: "Frontend", color: "#00C2E0" } }),
    prisma.label.create({ data: { name: "Research", color: "#51E898" } }),
    prisma.label.create({ data: { name: "Production", color: "#344563" } }),
  ]);

  const [bugLabel, featureLabel, enhanceLabel, urgentLabel, designLabel, backendLabel] = labels;
  console.log("✅ Created " + labels.length + " labels");

  // ─── Seed Boards ──────────────────────────────────────────────

  const board1 = await prisma.board.create({
    data: {
      title: "Project Management Tool",
      backgroundColor: "#0079BF",
    },
  });

  const board2 = await prisma.board.create({
    data: {
      title: "Marketing Campaign Q3",
      backgroundColor: "#D29034",
    },
  });

  const board3 = await prisma.board.create({
    data: {
      title: "Personal Tasks",
      backgroundColor: "#519839",
    },
  });

  console.log("✅ Created 3 boards");

  // ─── Seed Lists for Board 1 (main board) ──────────────────────

  const listBacklog = await prisma.list.create({
    data: { title: "Backlog", position: 1000, boardId: board1.id },
  });
  const listTodo = await prisma.list.create({
    data: { title: "To Do", position: 2000, boardId: board1.id },
  });
  const listInProgress = await prisma.list.create({
    data: { title: "In Progress", position: 3000, boardId: board1.id },
  });
  const listReview = await prisma.list.create({
    data: { title: "Code Review", position: 4000, boardId: board1.id },
  });
  const listDone = await prisma.list.create({
    data: { title: "Done ✅", position: 5000, boardId: board1.id },
  });

  console.log("✅ Created 5 lists for Board 1");

  // ─── Seed Cards ───────────────────────────────────────────────

  // Backlog cards
  const card1 = await prisma.card.create({
    data: {
      title: "Set up CI/CD pipeline",
      description: "Configure GitHub Actions for automated testing and deployment to Render.",
      position: 1000,
      listId: listBacklog.id,
    },
  });

  const card2 = await prisma.card.create({
    data: {
      title: "Add dark mode support",
      description: "Implement a dark mode toggle. Should persist preference in localStorage.",
      position: 2000,
      listId: listBacklog.id,
    },
  });

  // To Do cards
  const card3 = await prisma.card.create({
    data: {
      title: "Design card detail modal",
      description:
        "Create a responsive modal for viewing and editing card details. Should include labels, checklist, due dates, members, description, comments, and attachments.",
      position: 1000,
      listId: listTodo.id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    },
  });

  const card4 = await prisma.card.create({
    data: {
      title: "Implement drag and drop",
      description:
        "Use @hello-pangea/dnd to enable:\n- Drag and drop cards within a list\n- Drag and drop cards between lists\n- Drag and drop to reorder lists",
      position: 2000,
      listId: listTodo.id,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
    },
  });

  const card5 = await prisma.card.create({
    data: {
      title: "Build search & filter functionality",
      description: "Search by title, filter by labels, members, and due date.",
      position: 3000,
      listId: listTodo.id,
    },
  });

  // In Progress cards
  const card6 = await prisma.card.create({
    data: {
      title: "Create board management API",
      description: "CRUD endpoints for boards. Include list and card population.",
      position: 1000,
      listId: listInProgress.id,
      coverColor: "#0079BF",
    },
  });

  const card7 = await prisma.card.create({
    data: {
      title: "Database schema design",
      description:
        "Design PostgreSQL schema with Prisma.\n\nModels needed:\n- Board\n- List\n- Card\n- Label\n- Member\n- Checklist/ChecklistItem\n- Comment\n- Attachment\n- Activity",
      position: 2000,
      listId: listInProgress.id,
      coverColor: "#61BD4F",
    },
  });

  // Code Review cards
  const card8 = await prisma.card.create({
    data: {
      title: "Set up Express server with Prisma",
      description: "Initialize Express, configure Prisma ORM, set up routes structure.",
      position: 1000,
      listId: listReview.id,
    },
  });

  // Done cards
  const card9 = await prisma.card.create({
    data: {
      title: "Initialize project repositories",
      description: "Create client/ and server/ directories with initial configs.",
      position: 1000,
      listId: listDone.id,
    },
  });

  const card10 = await prisma.card.create({
    data: {
      title: "Choose tech stack",
      description:
        "React 19 + Vite + Tailwind CSS v4 for frontend\nNode.js + Express + Prisma + PostgreSQL for backend",
      position: 2000,
      listId: listDone.id,
    },
  });

  console.log("✅ Created 10 cards");

  // ─── Assign Labels to Cards ───────────────────────────────────

  await Promise.all([
    prisma.cardLabel.create({ data: { cardId: card1.id, labelId: backendLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: card2.id, labelId: featureLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: card2.id, labelId: designLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: card3.id, labelId: designLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: card3.id, labelId: featureLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: card4.id, labelId: featureLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: card4.id, labelId: urgentLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: card5.id, labelId: featureLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: card6.id, labelId: backendLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: card7.id, labelId: backendLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: card7.id, labelId: enhanceLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: card8.id, labelId: backendLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: card9.id, labelId: featureLabel.id } }),
    prisma.cardLabel.create({ data: { cardId: card10.id, labelId: enhanceLabel.id } }),
  ]);

  console.log("✅ Assigned labels to cards");

  // ─── Assign Members to Cards ──────────────────────────────────

  await Promise.all([
    prisma.cardMember.create({ data: { cardId: card3.id, memberId: ambuj.id } }),
    prisma.cardMember.create({ data: { cardId: card3.id, memberId: riya.id } }),
    prisma.cardMember.create({ data: { cardId: card4.id, memberId: ambuj.id } }),
    prisma.cardMember.create({ data: { cardId: card4.id, memberId: rahul.id } }),
    prisma.cardMember.create({ data: { cardId: card5.id, memberId: bhavya.id } }),
    prisma.cardMember.create({ data: { cardId: card6.id, memberId: ambuj.id } }),
    prisma.cardMember.create({ data: { cardId: card7.id, memberId: ambuj.id } }),
    prisma.cardMember.create({ data: { cardId: card7.id, memberId: kavita.id } }),
    prisma.cardMember.create({ data: { cardId: card8.id, memberId: rahul.id } }),
    prisma.cardMember.create({ data: { cardId: card9.id, memberId: ambuj.id } }),
    prisma.cardMember.create({ data: { cardId: card10.id, memberId: ambuj.id } }),
  ]);

  console.log("✅ Assigned members to cards");

  // ─── Seed Checklists ──────────────────────────────────────────

  const checklist1 = await prisma.checklist.create({
    data: {
      title: "DnD Implementation Steps",
      position: 1000,
      cardId: card4.id,
    },
  });

  await Promise.all([
    prisma.checklistItem.create({
      data: {
        text: "Install @hello-pangea/dnd",
        isCompleted: true,
        position: 1000,
        checklistId: checklist1.id,
      },
    }),
    prisma.checklistItem.create({
      data: {
        text: "Set up DragDropContext",
        isCompleted: true,
        position: 2000,
        checklistId: checklist1.id,
      },
    }),
    prisma.checklistItem.create({
      data: {
        text: "Implement card reordering within list",
        isCompleted: false,
        position: 3000,
        checklistId: checklist1.id,
      },
    }),
    prisma.checklistItem.create({
      data: {
        text: "Implement card moving between lists",
        isCompleted: false,
        position: 4000,
        checklistId: checklist1.id,
      },
    }),
    prisma.checklistItem.create({
      data: {
        text: "Implement list reordering",
        isCompleted: false,
        position: 5000,
        checklistId: checklist1.id,
      },
    }),
  ]);

  const checklist2 = await prisma.checklist.create({
    data: {
      title: "Schema Tables",
      position: 1000,
      cardId: card7.id,
    },
  });

  await Promise.all([
    prisma.checklistItem.create({
      data: { text: "Board model", isCompleted: true, position: 1000, checklistId: checklist2.id },
    }),
    prisma.checklistItem.create({
      data: { text: "List model", isCompleted: true, position: 2000, checklistId: checklist2.id },
    }),
    prisma.checklistItem.create({
      data: { text: "Card model", isCompleted: true, position: 3000, checklistId: checklist2.id },
    }),
    prisma.checklistItem.create({
      data: { text: "Label & CardLabel models", isCompleted: true, position: 4000, checklistId: checklist2.id },
    }),
    prisma.checklistItem.create({
      data: { text: "Checklist & ChecklistItem models", isCompleted: true, position: 5000, checklistId: checklist2.id },
    }),
    prisma.checklistItem.create({
      data: { text: "Comment model", isCompleted: false, position: 6000, checklistId: checklist2.id },
    }),
    prisma.checklistItem.create({
      data: { text: "Attachment model", isCompleted: false, position: 7000, checklistId: checklist2.id },
    }),
  ]);

  console.log("✅ Created checklists with items");

  // ─── Seed Comments ────────────────────────────────────────────

  await Promise.all([
    prisma.comment.create({
      data: {
        text: "I think we should use @hello-pangea/dnd instead of react-beautiful-dnd since it's actively maintained.",
        cardId: card4.id,
        memberId: ambuj.id,
      },
    }),
    prisma.comment.create({
      data: {
        text: "Good call! react-beautiful-dnd has been archived. Let's go with pangea.",
        cardId: card4.id,
        memberId: rahul.id,
      },
    }),
    prisma.comment.create({
      data: {
        text: "Schema design looks solid. I would suggest adding indexes on frequently queried fields.",
        cardId: card7.id,
        memberId: kavita.id,
      },
    }),
    prisma.comment.create({
      data: {
        text: "The modal should follow Trello's exact layout — content on left, actions on right sidebar.",
        cardId: card3.id,
        memberId: riya.id,
      },
    }),
  ]);

  console.log("✅ Created comments");

  // ─── Seed Activity Log ────────────────────────────────────────

  await Promise.all([
    prisma.activity.create({
      data: {
        action: "created this card",
        entityType: "card",
        entityId: card6.id,
        cardId: card6.id,
        memberId: ambuj.id,
      },
    }),
    prisma.activity.create({
      data: {
        action: "moved this card from To Do to In Progress",
        entityType: "card",
        entityId: card6.id,
        cardId: card6.id,
        memberId: ambuj.id,
        metadata: { from: "To Do", to: "In Progress" },
      },
    }),
    prisma.activity.create({
      data: {
        action: "added label Backend",
        entityType: "card",
        entityId: card6.id,
        cardId: card6.id,
        memberId: ambuj.id,
        metadata: { labelName: "Backend", labelColor: "#0079BF" },
      },
    }),
    prisma.activity.create({
      data: {
        action: "set the due date to " + new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        entityType: "card",
        entityId: card4.id,
        cardId: card4.id,
        memberId: ambuj.id,
      },
    }),
  ]);

  console.log("✅ Created activity log entries");

  // ─── Seed Lists for Board 2 (Marketing) ───────────────────────

  const mktIdeas = await prisma.list.create({
    data: { title: "Ideas", position: 1000, boardId: board2.id },
  });
  const mktPlanning = await prisma.list.create({
    data: { title: "Planning", position: 2000, boardId: board2.id },
  });
  const mktActive = await prisma.list.create({
    data: { title: "Active Campaigns", position: 3000, boardId: board2.id },
  });

  await Promise.all([
    prisma.card.create({
      data: { title: "Social media strategy for Q3", position: 1000, listId: mktIdeas.id },
    }),
    prisma.card.create({
      data: { title: "Blog post series on web development", position: 2000, listId: mktIdeas.id },
    }),
    prisma.card.create({
      data: { title: "Email newsletter redesign", position: 1000, listId: mktPlanning.id },
    }),
    prisma.card.create({
      data: { title: "Product launch campaign", position: 1000, listId: mktActive.id, coverColor: "#D29034" },
    }),
  ]);

  console.log("✅ Seeded Board 2 (Marketing)");

  // ─── Seed Lists for Board 3 (Personal) ────────────────────────

  const personalTodo = await prisma.list.create({
    data: { title: "To Do", position: 1000, boardId: board3.id },
  });
  const personalDoing = await prisma.list.create({
    data: { title: "Doing", position: 2000, boardId: board3.id },
  });

  await Promise.all([
    prisma.card.create({
      data: { title: "Complete DSA practice (Week 12)", position: 1000, listId: personalTodo.id },
    }),
    prisma.card.create({
      data: { title: "Read System Design book - Ch 5", position: 2000, listId: personalTodo.id },
    }),
    prisma.card.create({
      data: { title: "Build Trello clone for Scaler assignment 🎯", position: 1000, listId: personalDoing.id, coverColor: "#519839" },
    }),
  ]);

  console.log("✅ Seeded Board 3 (Personal)");

  console.log("\n🎉 Database seeded successfully!");
  console.log("Default user: Ambuj Jaiswal (ambuj@trello.com)");
  console.log("Total members: " + members.length);
  console.log("Total labels: " + labels.length);
  console.log("Total boards: 3");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
