const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const blogs = await prisma.blogPost.findMany({ select: { title: true, slug: true, status: true } });
  console.log('Blogs:', blogs);
}
main().finally(() => prisma.$disconnect());
