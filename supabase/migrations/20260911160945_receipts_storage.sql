-- Private receipt images. Uploads go through the service-role key;
-- the admin queue renders them via signed URLs.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS receipts_insert_service ON storage.objects;
CREATE POLICY receipts_insert_service
  ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS receipts_select_service ON storage.objects;
CREATE POLICY receipts_select_service
  ON storage.objects
  FOR SELECT
  TO service_role
  USING (bucket_id = 'receipts');

