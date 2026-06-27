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

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

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
    const file = Array.isArray(files.avatar) ? files.avatar[0] : files.avatar;

    if (!file || !orgId) {
      return res.status(400).json({ error: 'Missing file or orgId' });
    }

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Use JPEG, PNG, or WEBP.' });
    }

    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'File too large (max 3MB)' });
    }

    try {
      const fileBuffer = fs.readFileSync(file.filepath);
      const fileExt = file.mimetype.split('/')[1];
      const fileName = `${orgId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, fileBuffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        return res.status(500).json({ error: uploadError.message });
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabase
        .from('clubs')
        .update({ avatarUrl })
        .eq('id', orgId);

      if (dbError) {
        return res.status(500).json({ error: dbError.message });
      }

      return res.status(200).json({ avatarUrl });
    } catch (e) {
      return res.status(500).json({ error: e.message || 'Unexpected upload error' });
    }
  });
}
