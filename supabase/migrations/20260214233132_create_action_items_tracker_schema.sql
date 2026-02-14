/*
  # Meeting Action Items Tracker Schema

  1. New Tables
    - `transcripts`
      - `id` (uuid, primary key) - Unique identifier for each transcript
      - `title` (text) - Title/name of the meeting
      - `content` (text) - Full transcript text
      - `created_at` (timestamptz) - When the transcript was added
      - `user_id` (uuid) - Owner of the transcript (auth.users reference)
      
    - `action_items`
      - `id` (uuid, primary key) - Unique identifier for each action item
      - `transcript_id` (uuid, foreign key) - Reference to parent transcript
      - `task` (text) - The action item task description
      - `owner` (text, nullable) - Person responsible for the task
      - `due_date` (date, nullable) - When the task is due
      - `status` (text) - Status: 'open' or 'done'
      - `tags` (text[], nullable) - Array of tags for categorization
      - `created_at` (timestamptz) - When the item was created
      - `updated_at` (timestamptz) - When the item was last modified
      - `user_id` (uuid) - Owner of the action item (auth.users reference)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own transcripts and action items
    - Separate policies for SELECT, INSERT, UPDATE, DELETE operations

  3. Indexes
    - Index on transcript_id for faster action item lookups
    - Index on status for filtering
    - Index on created_at for sorting
*/

-- Create transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create action_items table
CREATE TABLE IF NOT EXISTS action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id uuid NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  task text NOT NULL,
  owner text,
  due_date date,
  status text NOT NULL DEFAULT 'open',
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_action_items_transcript_id ON action_items(transcript_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON action_items(status);
CREATE INDEX IF NOT EXISTS idx_action_items_created_at ON action_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transcripts_created_at ON transcripts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transcripts_user_id ON transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_action_items_user_id ON action_items(user_id);

-- Enable Row Level Security
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- Transcripts policies
CREATE POLICY "Users can view own transcripts"
  ON transcripts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transcripts"
  ON transcripts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transcripts"
  ON transcripts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transcripts"
  ON transcripts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Action items policies
CREATE POLICY "Users can view own action items"
  ON action_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own action items"
  ON action_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own action items"
  ON action_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own action items"
  ON action_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);