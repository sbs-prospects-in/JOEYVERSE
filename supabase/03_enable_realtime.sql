-- Enable realtime for the consultations table so the Pet Owner gets the UPDATE event
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;

-- Set Replica Identity to FULL so RLS policies can be correctly evaluated for UPDATE events
ALTER TABLE public.consultations REPLICA IDENTITY FULL;
