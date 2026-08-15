-- AlterTable
ALTER TABLE "Session"
ADD COLUMN "dutyLeaveDocUrl" TEXT,
ADD COLUMN "dutyLeaveDocUploadedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DutyLeaveRequest" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DutyLeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DutyLeaveRequest_sessionId_studentId_key" ON "DutyLeaveRequest"("sessionId", "studentId");

-- AddForeignKey
ALTER TABLE "DutyLeaveRequest" ADD CONSTRAINT "DutyLeaveRequest_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DutyLeaveRequest" ADD CONSTRAINT "DutyLeaveRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
