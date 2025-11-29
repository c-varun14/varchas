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
  { name: "C-CYCLE" },
  { name: "CG" },
  { name: "CH" },
  { name: "CSE" },
  { name: "CV" },
  { name: "DSE" },
  { name: "ECE" },
  { name: "ElECTRO" },
  { name: "EEE" },
  { name: "ISE" },
  { name: "ME" },
  { name: "P-CYCLE" },
];

export async function main() {
  for (const department of departments) {
    await prisma.department.create({ data: department });
  }
}

main();
