export interface CloudinaryUploadResult {
  secure_url: string;
}

export async function uploadToCloudinary(file: File) {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD;
  const preset = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET;

  if (!cloud || !preset) {
    throw new Error('Cloudinary environment variables are missing');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Cloudinary upload failed');
  }

  const data = (await response.json()) as CloudinaryUploadResult;
  return data.secure_url;
}
