-- Migration: Add event_details JSONB column to proposals table
-- Description: Stores rich, structured multi-step dynamic proposal event data, coordinator details, and itemised expense items.
-- Constraints: Not null with empty JSON object default to preserve compatibility with existing proposals.

ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS event_details JSONB NOT NULL DEFAULT '{}'::jsonb;
