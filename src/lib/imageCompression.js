export async function compressThumbnail(file, maxWidth = 640, quality = 0.78) {
  if (!file) return null;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        const webpFile = new File([blob], `${crypto.randomUUID()}.webp`, {
          type: 'image/webp'
        });
        resolve(webpFile);
      },
      'image/webp',
      quality
    );
  });
}
