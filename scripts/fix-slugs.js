const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

async function main() {
  const blogs = await prisma.blogPost.findMany();
  for (const blog of blogs) {
    const newSlug = generateSlug(blog.slug || blog.title);
    if (newSlug !== blog.slug) {
      console.log(`Updating slug: "${blog.slug}" -> "${newSlug}"`);
      await prisma.blogPost.update({
        where: { id: blog.id },
        data: { slug: newSlug }
      });
    }
  }
  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
