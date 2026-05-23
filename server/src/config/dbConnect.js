// config/dbConnect.js — Prisma Client Singleton
// Same pattern as DevTinder's dbConnect.js but for PostgreSQL via Prisma

const { PrismaClient } = require("@prisma/client");

let prisma;

const dbConnect = () => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
};

module.exports = dbConnect;
