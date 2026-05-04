import { PrismaClient, TopicStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME?.trim() || "admin";
  const password = process.env.ADMIN_PASSWORD?.trim() || "admin123";
  const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() || "Administrator";

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (!existing) {
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.admin.create({
      data: { username, hashedPassword, displayName },
    });
    console.log(`Created admin user "${username}".`);
  } else {
    console.log(`Admin "${username}" already exists — skipping create.`);
  }

  const count = await prisma.topic.count();
  if (count === 0) {
    const t = await prisma.topic.create({
      data: {
        title: "Welcome to TMT Votes",
        description:
          "This is a sample active topic. Vote with your email or phone — each identifier may vote once.",
        status: TopicStatus.ACTIVE,
        featured: true,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        options: {
          create: [
            { optionText: "Love the design", voteCount: 0 },
            { optionText: "Want more topics", voteCount: 0 },
          ],
        },
      },
    });
    console.log(`Created sample topic ${t.id}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
