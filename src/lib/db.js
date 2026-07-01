import { PrismaClient } from '@prisma/client';
// Cache buster for HMR: 2

const globalForPrisma = globalThis;

const prismaClientSingleton = () => {
  return new PrismaClient();
};

delete globalForPrisma.prisma; // Force cache bust
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
