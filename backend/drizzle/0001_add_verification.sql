-- Migration: Add email verification fields to User and create UserVerification table
-- Created: 2026-04-13

-- Add isVerified and isActive columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT FALSE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT TRUE;

-- Create UserVerification table
CREATE TABLE IF NOT EXISTS "UserVerification" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id"),
  "token" TEXT NOT NULL UNIQUE,
  "tokenHash" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Add tokenHash, maxUses, uses columns to Invitation table
ALTER TABLE "Invitation" ADD COLUMN IF NOT EXISTS "tokenHash" TEXT NOT NULL;
ALTER TABLE "Invitation" ADD COLUMN IF NOT EXISTS "maxUses" INTEGER DEFAULT 1;
ALTER TABLE "Invitation" ADD COLUMN IF NOT EXISTS "uses" INTEGER DEFAULT 0;