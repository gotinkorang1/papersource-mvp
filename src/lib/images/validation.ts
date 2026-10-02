const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

/** Verify the actual file header instead of trusting the browser MIME label. */
export async function hasSupportedImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (file.type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === "image/png") return startsWith(bytes, PNG_SIGNATURE);
  if (file.type === "image/webp") return startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes.slice(8), [0x57, 0x45, 0x42, 0x50]);
  if (file.type === "image/avif") {
    const brand = new TextDecoder().decode(bytes.slice(4, 12));
    return brand.startsWith("ftypavif") || brand.startsWith("ftypavis");
  }
  return false;
}
