export type CropRatio = "free" | "4:5" | "5:4" | "3:4" | "4:3";

export type CropRect = { x: number; y: number; width: number; height: number };

export function centeredCropRect(width: number, height: number, ratio: Exclude<CropRatio, "free">): CropRect {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error("Image dimensions must be positive.");
  }
  const [ratioWidth, ratioHeight] = ratio.split(":").map(Number);
  const targetRatio = ratioWidth / ratioHeight;
  const sourceRatio = width / height;
  let cropWidth = width;
  let cropHeight = height;
  if (sourceRatio > targetRatio) cropWidth = Math.round(cropHeight * targetRatio);
  else cropHeight = Math.round(cropWidth / targetRatio);
  return {
    x: Math.round((width - cropWidth) / 2),
    y: Math.round((height - cropHeight) / 2),
    width: cropWidth,
    height: cropHeight,
  };
}
