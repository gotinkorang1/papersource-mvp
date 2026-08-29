/** Public product media via Cloudinary. Private RFQs use Supabase Storage. */
export function cloudinaryCloudName() {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? null;
}
