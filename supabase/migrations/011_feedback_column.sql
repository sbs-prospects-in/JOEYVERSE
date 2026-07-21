
-- Rename review_text to feedback if it exists
DO $ody$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='consultations' and column_name='review_text') THEN
    ALTER TABLE public.consultations RENAME COLUMN review_text TO feedback;
  END IF;

  IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='consultations' and column_name='feedback') THEN
    ALTER TABLE public.consultations ADD COLUMN feedback TEXT;
  END IF;
END
$ody$;

-- Add trigger to automatically update doctor rating when a consultation rating is updated
CREATE OR REPLACE FUNCTION public.update_doctor_rating()
RETURNS TRIGGER AS $body
DECLARE
  avg_rating NUMERIC;
  rev_count INTEGER;
BEGIN
  IF (NEW.rating IS NOT NULL) THEN
    SELECT AVG(rating), COUNT(rating) INTO avg_rating, rev_count
    FROM public.consultations
    WHERE doctor_id = NEW.doctor_id AND rating IS NOT NULL;
    
    UPDATE public.doctor_profiles
    SET rating = ROUND(avg_rating, 2), reviews_count = rev_count
    WHERE id = NEW.doctor_id;
  END IF;
  RETURN NEW;
END;
$body LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_doctor_rating ON public.consultations;
CREATE TRIGGER trg_update_doctor_rating
AFTER UPDATE OF rating ON public.consultations
FOR EACH ROW
EXECUTE PROCEDURE public.update_doctor_rating();

