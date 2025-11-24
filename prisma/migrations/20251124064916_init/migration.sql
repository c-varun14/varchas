-- CreateEnum
CREATE TYPE "DEPARTMENTNAME" AS ENUM ('AE', 'AIML', 'AS', 'C-Cycle', 'CG', 'CH', 'CSE', 'CV', 'DSE', 'ECE', 'ECE-ACT', 'EEE', 'IIOT', 'ISE', 'ME', 'P-Cycle', 'VLSI');

-- CreateEnum
CREATE TYPE "SPORTS" AS ENUM ('BADMINTON', 'FOOTBALL', 'BASKETBALL', 'KHO-KHO', 'KABBADI', 'VOLLEYBALL', 'TABLE TENNIS', 'CHESS', 'CARROM', 'THROWBALL', 'BOX CRICKET');

-- CreateTable
CREATE TABLE "DEPARTMENT" (
    "name" "DEPARTMENTNAME" NOT NULL,

    CONSTRAINT "DEPARTMENT_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Sport_event" (
    "id" TEXT NOT NULL,
    "name" "SPORTS" NOT NULL,
    "gender" TEXT NOT NULL,

    CONSTRAINT "Sport_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Points" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "department_id" "DEPARTMENTNAME" NOT NULL,
    "matches" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Points_event_id_department_id_key" ON "Points"("event_id", "department_id");

-- AddForeignKey
ALTER TABLE "Points" ADD CONSTRAINT "Points_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Sport_event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Points" ADD CONSTRAINT "Points_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "DEPARTMENT"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
