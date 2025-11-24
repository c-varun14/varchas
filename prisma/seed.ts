import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const departments = [
  { name: "AE" },
  { name: "AIML" },
  { name: "AS" },
  { name: "C_CYCLE" },
  { name: "CG" },
  { name: "CH" },
  { name: "CSE" },
  { name: "CV" },
  { name: "DSE" },
  { name: "ECE" },
  { name: "ECE_ACT" },
  { name: "EEE" },
  { name: "IIOT" },
  { name: "ISE" },
  { name: "ME" },
  { name: "P_CYCLE" },
  { name: "VLSI" },
];

export async function main() {
  for (const department of departments) {
    // @ts-expect-error The type is correct
    await prisma.department.create({ data: department });
  }
}

main();
