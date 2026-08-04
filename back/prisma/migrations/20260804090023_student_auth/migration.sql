/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "username" TEXT,
ALTER COLUMN "rfidUid" DROP NOT NULL,
ALTER COLUMN "role" DROP NOT NULL,
ALTER COLUMN "team" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_username_key" ON "public"."Student"("username");
