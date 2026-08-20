import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@mogoj.app" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@mogoj.app",
      passwordHash,
      preferences: {},
    },
  });

  const personalArea = await prisma.area.create({
    data: {
      userId: user.id,
      name: "Personal",
      color: "#f97316",
      icon: "home",
      order: 0,
    },
  });

  const workArea = await prisma.area.create({
    data: {
      userId: user.id,
      name: "Work",
      color: "#6366f1",
      icon: "briefcase",
      order: 1,
    },
  });

  const websiteProject = await prisma.project.create({
    data: {
      userId: user.id,
      areaId: workArea.id,
      name: "Launch Portfolio Site",
      description: "Ship v1 of the personal portfolio site.",
      priority: "high",
      order: 0,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        projectId: websiteProject.id,
        title: "Wireframe homepage",
        status: "done",
        priority: "medium",
        order: 0,
      },
      {
        userId: user.id,
        projectId: websiteProject.id,
        title: "Build hero section",
        status: "in_progress",
        priority: "high",
        order: 0,
      },
      {
        userId: user.id,
        projectId: websiteProject.id,
        title: "Write copy for about page",
        status: "todo",
        priority: "medium",
        order: 0,
      },
      {
        userId: user.id,
        areaId: personalArea.id,
        title: "Book dentist appointment",
        status: "todo",
        priority: "low",
        order: 0,
      },
    ],
  });

  await prisma.resource.create({
    data: {
      userId: user.id,
      projectId: websiteProject.id,
      title: "Brand guidelines",
      type: "note",
      content: { type: "doc", content: [] },
      tags: ["branding"],
    },
  });

  await prisma.inboxItem.create({
    data: {
      userId: user.id,
      title: "Look into new note-taking app",
      type: "idea",
    },
  });

  console.log("Seed complete:", { userId: user.id, email: user.email });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
