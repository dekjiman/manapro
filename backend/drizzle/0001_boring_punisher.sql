CREATE TABLE "UserVerification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"token" text NOT NULL,
	"tokenHash" text NOT NULL,
	"type" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "UserVerification_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "Invitation" ADD COLUMN "tokenHash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "Invitation" ADD COLUMN "maxUses" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "Invitation" ADD COLUMN "uses" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "isVerified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "isActive" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "UserVerification" ADD CONSTRAINT "UserVerification_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;