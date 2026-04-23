import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required in .env.local");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      isActive: true,
      emailVerifiedAt: new Date(),
      lastSeenAt: new Date(),
    },
    create: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      isActive: true,
      emailVerifiedAt: new Date(),
      lastSeenAt: new Date(),
    },
  });

  await prisma.wallet.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      pendingBalance: 0,
      confirmedBalance: 0,
      availableBalance: 0,
      lifetimeEarned: 0,
      lifetimeWithdrawn: 0,
      lifetimeRejected: 0,
    },
  });

  console.log("Admin ready:");
  console.log(`Email: ${user.email}`);
  console.log("Role: ADMIN");
}

main()
  .catch((error) => {
    console.error("CREATE_ADMIN_ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });