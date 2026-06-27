import { useState } from 'react';

const MAX_DIMENSION = 400;

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
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.85
      );
    };
    img.onerror = reject;

    reader.readAsDataURL(file);
  });
}

export default function AvatarUploader({ orgId, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setError('');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WEBP image.');
      return;
    }

    setUploading(true);

    try {
      const resizedFile = await resizeImage(file);

      const formData = new FormData();
      formData.append('avatar', resizedFile);
      formData.append('orgId', orgId);

      const res = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        onUploadSuccess?.(data.avatarUrl);
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
        accept="image/jpeg,image/png,image/webp"
        onChange={handleAvatarUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: '#ff4444' }}>{error}</p>}
    </div>
  );
}
