import { useState } from 'react';

const MAX_DIMENSION = 400;

// Same resize approach as AvatarUploader, but outputs PNG instead of JPEG
// so transparent backgrounds (very common in sponsor logos) are preserved.
// SVGs are passed through untouched — rasterizing a vector logo onto a
// canvas would throw away the exact thing that makes SVG useful here.
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = reject;

    img.onload = () => {
      let { width, height } = img;

      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
        resolve(file);
        return;
      }

      if (width > height && width > MAX_DIMENSION) {
        height = Math.round((height * MAX_DIMENSION) / width);
        width = MAX_DIMENSION;
      } else if (height > MAX_DIMENSION) {
        width = Math.round((width * MAX_DIMENSION) / height);
        height = MAX_DIMENSION;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Resize failed'));
          resolve(new File([blob], file.name, { type: 'image/png' }));
        },
        'image/png'
      );
    };
    img.onerror = reject;

    reader.readAsDataURL(file);
  });
}

export default function SponsorLogoUploader({ orgId, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setError('');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, WEBP, or SVG image.');
      return;
    }

    setUploading(true);

    try {
      const outFile = file.type === 'image/svg+xml' ? file : await resizeImage(file);

      const formData = new FormData();
      formData.append('sponsorLogo', outFile);
      formData.append('orgId', orgId);

      const res = await fetch('/api/upload-sponsor-logo', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        onUploadSuccess?.(data.sponsorLogoUrl);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Something went wrong processing the image.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        onChange={handleLogoUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: '#ff4444' }}>{error}</p>}
    </div>
  );
}
