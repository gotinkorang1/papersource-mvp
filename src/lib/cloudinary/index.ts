/** Public product media via Cloudinary. Private RFQs use Supabase Storage. */
export function cloudinaryCloudName() {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? null;
}

export function cloudinaryImageUrl(publicId: string, width = 1200) {
  const cloudName = cloudinaryCloudName();
  if (!cloudName || !publicId.trim()) return null;
  const encodedId = publicId
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${width}/${encodedId}`;
}
