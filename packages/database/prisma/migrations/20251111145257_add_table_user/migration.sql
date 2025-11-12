-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hashedRefreshToken" TEXT;

-- CreateTable
CREATE TABLE "AuthOtp" (
    "id" TEXT NOT NULL,
    "hashedOtp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AuthOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuthOtp_userId_idx" ON "AuthOtp"("userId");

-- AddForeignKey
ALTER TABLE "AuthOtp" ADD CONSTRAINT "AuthOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
