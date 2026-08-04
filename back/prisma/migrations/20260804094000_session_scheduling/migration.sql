-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "venue" TEXT,
ADD COLUMN     "notificationChannel" TEXT,
ADD COLUMN     "notificationTarget" TEXT,
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;