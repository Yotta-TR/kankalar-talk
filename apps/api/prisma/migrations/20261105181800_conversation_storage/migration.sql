-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ConversationMode" AS ENUM ('PRIVATE', 'KANKALAR_ROOM');

-- CreateEnum
CREATE TYPE "Character" AS ENUM ('EREN', 'ELIF');

-- CreateEnum
CREATE TYPE "MessageSpeaker" AS ENUM ('LEARNER', 'CHARACTER');

-- CreateEnum
CREATE TYPE "MessageRequestStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "mode" "ConversationMode" NOT NULL,
    "character" "Character",
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "conversation_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "sequence_no" INTEGER NOT NULL,
    "speaker" "MessageSpeaker" NOT NULL,
    "character" "Character",
    "text" TEXT NOT NULL,
    "correction" JSONB,
    "explanation" JSONB,
    "request_id" UUID,
    "reply_to_message_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_requests" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "client_request_id" TEXT NOT NULL,
    "request_hash" TEXT NOT NULL,
    "status" "MessageRequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "message_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversation_sessions_user_id_created_at_idx" ON "conversation_sessions"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_sessions_id_user_id_key" ON "conversation_sessions"("id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "messages_request_id_key" ON "messages"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "messages_request_id_session_id_key" ON "messages"("request_id", "session_id");

-- CreateIndex
CREATE UNIQUE INDEX "messages_reply_to_message_id_key" ON "messages"("reply_to_message_id");

-- CreateIndex
CREATE INDEX "messages_session_id_created_at_idx" ON "messages"("session_id", "created_at");

-- Preserve a unique sequence number for each session.
CREATE UNIQUE INDEX "messages_session_id_sequence_no_key" ON "messages"("session_id", "sequence_no");

-- CreateIndex
CREATE UNIQUE INDEX "message_requests_id_session_id_key" ON "message_requests"("id", "session_id");

-- CreateIndex
CREATE INDEX "message_requests_session_id_created_at_idx" ON "message_requests"("session_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "message_requests_user_id_client_request_id_key" ON "message_requests"("user_id", "client_request_id");

-- AddForeignKey
ALTER TABLE "conversation_sessions" ADD CONSTRAINT "conversation_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "conversation_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_request_id_session_id_fkey" FOREIGN KEY ("request_id", "session_id") REFERENCES "message_requests"("id", "session_id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_message_id_fkey" FOREIGN KEY ("reply_to_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_requests" ADD CONSTRAINT "message_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_requests" ADD CONSTRAINT "message_requests_session_id_user_id_fkey" FOREIGN KEY ("session_id", "user_id") REFERENCES "conversation_sessions"("id", "user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enforce that private sessions choose one character and the Kankalar room does not.
ALTER TABLE "conversation_sessions"
ADD CONSTRAINT "conversation_sessions_mode_character_check"
CHECK (
    ("mode" = 'PRIVATE' AND "character" IS NOT NULL)
    OR ("mode" = 'KANKALAR_ROOM' AND "character" IS NULL)
);

-- Learner messages have no character; character replies always identify their speaker.
ALTER TABLE "messages"
ADD CONSTRAINT "messages_speaker_character_check"
CHECK (
    ("speaker" = 'LEARNER' AND "character" IS NULL)
    OR ("speaker" = 'CHARACTER' AND "character" IS NOT NULL)
);
