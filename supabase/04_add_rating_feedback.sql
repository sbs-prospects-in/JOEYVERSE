ALTER TABLE consultations ADD COLUMN IF NOT EXISTS rating integer;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS feedback text;