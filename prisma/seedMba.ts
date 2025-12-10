import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

// MBA Department
const mbaDepartment = {
  name: "MBA",
};

export async function main() {
  try {
    console.log("Creating MBA department...");

    // Create MBA department
    const department = await prisma.department.upsert({
      where: { name: "MBA" },
      update: {},
      create: mbaDepartment,
    });

    console.log("MBA department created successfully!");

    console.log("Fetching existing sport events...");

    // Fetch all existing sport events
    const existingEvents = await prisma.sport_event.findMany({
      orderBy: [{ name: "asc" }, { gender: "asc" }],
    });

    if (existingEvents.length === 0) {
      console.log("No sport events found. Please create sport events first.");
      return;
    }

    console.log(`Found ${existingEvents.length} existing sport events!`);

    console.log("Creating scores for MBA department...");

    // Create scores for MBA department in all existing events
    for (const event of existingEvents) {
      await prisma.score.create({
        data: {
          event_id: event.id,
          department_id: department.name,
        },
      });

      console.log(`Created score for MBA in ${event.name} (${event.gender})`);
    }
    console.log("MBA seed data created successfully!");
  } catch (error) {
    console.error("Error creating MBA seed data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
