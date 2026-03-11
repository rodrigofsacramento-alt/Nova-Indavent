-- Create storage bucket for leads if it doesn't exist
-- Note: This might require extensions or specific permissions depending on Supabase version
-- Usually handled via dashboard, but we can try to insert into storage.buckets

INSERT INTO storage.buckets (id, name, public)
SELECT 'leads', 'leads', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'leads'
);

-- Set up storage policies for the 'leads' bucket
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'leads');

-- Allow authenticated uploads
CREATE POLICY "Authenticated Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'leads');

-- Allow authenticated deletes
CREATE POLICY "Authenticated Deletes" ON storage.objects FOR DELETE USING (bucket_id = 'leads');
