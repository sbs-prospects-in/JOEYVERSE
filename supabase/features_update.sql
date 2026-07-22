-- 1. Notification Center (Point 3)
CREATE TABLE IF NOT EXISTS notifications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
ON notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Feedback Submission Error (Point 18)
-- Ensure consultations table has rating and feedback columns
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS rating integer;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS feedback text;

-- 4. Wishlist SQL (Point 8)
ALTER TABLE wishlists ADD UNIQUE(user_id, doctor_id);
