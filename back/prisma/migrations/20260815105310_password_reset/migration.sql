-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordResetRequested" BOOLEAN NOT NULL DEFAULT false;
