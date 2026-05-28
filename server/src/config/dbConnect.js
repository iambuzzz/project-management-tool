const { PrismaClient } = require("@prisma/client");

let prisma;

const dbConnect = () => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
};

module.exports = dbConnect;
