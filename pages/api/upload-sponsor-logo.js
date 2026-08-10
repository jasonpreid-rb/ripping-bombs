import { createClient } from '@supabase/supabase-js';
import { IncomingForm } from 'formidable';
import fs from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: { bodyParser: false },
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

// NOTE: uses a separate 'sponsors' storage bucket from avatars — create it
// in Supabase Storage (public bucket, same policy pattern as 'avatars')
// before this route is used for the first time.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Upload parse failed' });
    }

    const orgId = Array.isArray(fields.orgId) ? fields.orgId[0] : fields.orgId;
    const file = Array.isArray(files.sponsorLogo) ? files.sponsorLogo[0] : files.sponsorLogo;

    if (!file || !orgId) {
      return res.status(400).json({ error: 'Missing file or orgId' });
    }

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Use JPEG, PNG, WEBP, or SVG.' });
    }

    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'File too large (max 3MB)' });
    }

    try {
      const fileBuffer = fs.readFileSync(file.filepath);
      const fileExt = file.mimetype.split('/')[1].replace('svg+xml', 'svg');
      const fileName = `${orgId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('sponsors')
        .upload(fileName, fileBuffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        return res.status(500).json({ error: uploadError.message });
      }

      const { data: publicUrlData } = supabase.storage
        .from('sponsors')
        .getPublicUrl(fileName);

      const sponsorLogoUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabase
        .from('clubs')
        .update({ sponsorLogoUrl })
        .eq('id', orgId);

      if (dbError) {
        return res.status(500).json({ error: dbError.message });
      }

      return res.status(200).json({ sponsorLogoUrl });
    } catch (e) {
      return res.status(500).json({ error: e.message || 'Unexpected upload error' });
    }
  });
}
