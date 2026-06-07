-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('FAN', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "TrustLevel" AS ENUM ('NEW', 'REGULAR', 'TRUSTED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'SYSTEM', 'ITINERARY_SHARE', 'MATCH_SHARE', 'LOCATION_SHARE');

-- CreateEnum
CREATE TYPE "MeetupStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MatchStage" AS ENUM ('GROUP', 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'THIRD_PLACE', 'FINAL');

-- CreateEnum
CREATE TYPE "StampType" AS ENUM ('CITY_VISIT', 'MATCH_ATTENDED', 'FANS_MET', 'GROUP_JOINED', 'ITINERARY_COMPLETED', 'TOURNAMENT_ACHIEVEMENT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MATCH_REMINDER', 'MEETUP_ALERT', 'FAN_MATCH', 'GROUP_MESSAGE', 'TRAVEL_ALERT', 'NEARBY_FAN', 'ACHIEVEMENT');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'HARASSMENT', 'FAKE_PROFILE', 'INAPPROPRIATE_CONTENT', 'SCAM', 'OTHER');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'ES', 'PT', 'FR', 'DE', 'JA', 'KO', 'AR', 'ZH');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerk_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "bio" TEXT,
    "nationality" TEXT,
    "country_flag" TEXT,
    "supported_team" TEXT,
    "age_range" TEXT,
    "host_cities" TEXT[],
    "travel_dates" JSONB,
    "languages" "Language"[],
    "primary_language" "Language" NOT NULL DEFAULT 'EN',
    "interests" TEXT[],
    "role" "UserRole" NOT NULL DEFAULT 'FAN',
    "trustLevel" "TrustLevel" NOT NULL DEFAULT 'NEW',
    "risk_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "banned_at" TIMESTAMP(3),
    "banned_reason" TEXT,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "premium_until" TIMESTAMP(3),
    "embedding_version" INTEGER NOT NULL DEFAULT 0,
    "push_token" TEXT,
    "notif_settings" JSONB,
    "privacy_settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_active_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "world_cup_matches" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "home_team" TEXT NOT NULL,
    "away_team" TEXT NOT NULL,
    "home_team_code" TEXT NOT NULL,
    "away_team_code" TEXT NOT NULL,
    "home_score" INTEGER,
    "away_score" INTEGER,
    "stadium" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "city_slug" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "stage" "MatchStage" NOT NULL,
    "kickoff_at" TIMESTAMP(3) NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "meta_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "world_cup_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tickets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "section" TEXT,
    "row" TEXT,
    "seat" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "match_score" DOUBLE PRECISION NOT NULL,
    "match_reasons" JSONB,
    "icebreaker" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "emoji" TEXT,
    "image_url" TEXT,
    "city_slug" TEXT,
    "country" TEXT,
    "team_code" TEXT,
    "match_id" TEXT,
    "tags" TEXT[],
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "max_members" INTEGER NOT NULL DEFAULT 1000,
    "owner_id" TEXT NOT NULL,
    "health_score" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_muted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "group_id" TEXT,
    "connection_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_members" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "last_read_at" TIMESTAMP(3),

    CONSTRAINT "conversation_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "metadata" JSONB,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "moderation_score" DOUBLE PRECISION,
    "translations" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetups" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "emoji" TEXT NOT NULL DEFAULT '⚽',
    "city_slug" TEXT NOT NULL,
    "venue_name" TEXT NOT NULL,
    "venue_address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3),
    "group_id" TEXT,
    "creator_id" TEXT NOT NULL,
    "max_attendees" INTEGER,
    "status" "MeetupStatus" NOT NULL DEFAULT 'ACTIVE',
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetup_attendees" (
    "id" TEXT NOT NULL,
    "meetup_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'going',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meetup_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passports" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "match_count" INTEGER NOT NULL DEFAULT 0,
    "city_count" INTEGER NOT NULL DEFAULT 0,
    "fans_met_count" INTEGER NOT NULL DEFAULT 0,
    "groups_joined" INTEGER NOT NULL DEFAULT 0,
    "countries_represented" TEXT[],
    "journey_story" TEXT,
    "story_generated_at" TIMESTAMP(3),
    "share_code" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stamps" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "passport_id" TEXT NOT NULL,
    "type" "StampType" NOT NULL,
    "city_slug" TEXT,
    "match_id" TEXT,
    "description" TEXT,
    "icon_emoji" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stamps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itineraries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "city_slug" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "prompt" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "match_id" TEXT,
    "hours_before_match" INTEGER,
    "is_saved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "reported_id" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "message_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "moderator_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_cities" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "stadium_name" TEXT,
    "stadium_capacity" INTEGER,
    "airport_code" TEXT,
    "tips" JSONB,

    CONSTRAINT "host_cities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_clerk_id_idx" ON "users"("clerk_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_nationality_idx" ON "users"("nationality");

-- CreateIndex
CREATE INDEX "users_supported_team_idx" ON "users"("supported_team");

-- CreateIndex
CREATE INDEX "users_trustLevel_idx" ON "users"("trustLevel");

-- CreateIndex
CREATE INDEX "users_risk_score_idx" ON "users"("risk_score");

-- CreateIndex
CREATE INDEX "users_last_active_at_idx" ON "users"("last_active_at");

-- CreateIndex
CREATE UNIQUE INDEX "world_cup_matches_external_id_key" ON "world_cup_matches"("external_id");

-- CreateIndex
CREATE INDEX "world_cup_matches_city_slug_idx" ON "world_cup_matches"("city_slug");

-- CreateIndex
CREATE INDEX "world_cup_matches_kickoff_at_idx" ON "world_cup_matches"("kickoff_at");

-- CreateIndex
CREATE INDEX "world_cup_matches_stage_idx" ON "world_cup_matches"("stage");

-- CreateIndex
CREATE INDEX "world_cup_matches_home_team_code_idx" ON "world_cup_matches"("home_team_code");

-- CreateIndex
CREATE INDEX "world_cup_matches_away_team_code_idx" ON "world_cup_matches"("away_team_code");

-- CreateIndex
CREATE INDEX "user_tickets_match_id_idx" ON "user_tickets"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tickets_user_id_match_id_key" ON "user_tickets"("user_id", "match_id");

-- CreateIndex
CREATE INDEX "connections_receiver_id_idx" ON "connections"("receiver_id");

-- CreateIndex
CREATE INDEX "connections_status_idx" ON "connections"("status");

-- CreateIndex
CREATE UNIQUE INDEX "connections_sender_id_receiver_id_key" ON "connections"("sender_id", "receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "groups_slug_key" ON "groups"("slug");

-- CreateIndex
CREATE INDEX "groups_city_slug_idx" ON "groups"("city_slug");

-- CreateIndex
CREATE INDEX "groups_team_code_idx" ON "groups"("team_code");

-- CreateIndex
CREATE INDEX "groups_slug_idx" ON "groups"("slug");

-- CreateIndex
CREATE INDEX "groups_is_public_idx" ON "groups"("is_public");

-- CreateIndex
CREATE INDEX "group_members_user_id_idx" ON "group_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_group_id_user_id_key" ON "group_members"("group_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_group_id_key" ON "conversations"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_connection_id_key" ON "conversations"("connection_id");

-- CreateIndex
CREATE INDEX "conversations_type_idx" ON "conversations"("type");

-- CreateIndex
CREATE INDEX "conversation_members_user_id_idx" ON "conversation_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_members_conversation_id_user_id_key" ON "conversation_members"("conversation_id", "user_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "messages_is_flagged_idx" ON "messages"("is_flagged");

-- CreateIndex
CREATE INDEX "meetups_city_slug_starts_at_idx" ON "meetups"("city_slug", "starts_at");

-- CreateIndex
CREATE INDEX "meetups_group_id_idx" ON "meetups"("group_id");

-- CreateIndex
CREATE INDEX "meetups_status_idx" ON "meetups"("status");

-- CreateIndex
CREATE INDEX "meetup_attendees_user_id_idx" ON "meetup_attendees"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "meetup_attendees_meetup_id_user_id_key" ON "meetup_attendees"("meetup_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "passports_user_id_key" ON "passports"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "passports_share_code_key" ON "passports"("share_code");

-- CreateIndex
CREATE INDEX "stamps_user_id_idx" ON "stamps"("user_id");

-- CreateIndex
CREATE INDEX "stamps_type_idx" ON "stamps"("type");

-- CreateIndex
CREATE INDEX "itineraries_user_id_date_idx" ON "itineraries"("user_id", "date");

-- CreateIndex
CREATE INDEX "itineraries_city_slug_idx" ON "itineraries"("city_slug");

-- CreateIndex
CREATE INDEX "reports_reported_id_idx" ON "reports"("reported_id");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "moderation_logs_user_id_idx" ON "moderation_logs"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "host_cities_slug_key" ON "host_cities"("slug");

-- AddForeignKey
ALTER TABLE "user_tickets" ADD CONSTRAINT "user_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tickets" ADD CONSTRAINT "user_tickets_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "world_cup_matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "world_cup_matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetups" ADD CONSTRAINT "meetups_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetups" ADD CONSTRAINT "meetups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetup_attendees" ADD CONSTRAINT "meetup_attendees_meetup_id_fkey" FOREIGN KEY ("meetup_id") REFERENCES "meetups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetup_attendees" ADD CONSTRAINT "meetup_attendees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passports" ADD CONSTRAINT "passports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stamps" ADD CONSTRAINT "stamps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stamps" ADD CONSTRAINT "stamps_passport_id_fkey" FOREIGN KEY ("passport_id") REFERENCES "passports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_id_fkey" FOREIGN KEY ("reported_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
