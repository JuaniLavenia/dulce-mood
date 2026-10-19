// Phone photos weigh several MB. For Cloudinary URLs pasted in the sheet, ask
// Cloudinary for a modern format (f_auto), automatic quality (q_auto) and at most
// 800px wide (w_800, c_limit never upscales): enough for cards on 2x screens.
const TRANSFORMATION = 'f_auto,q_auto,w_800,c_limit';
const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)/;

export function optimizeImage(url: string) {
  if (!CLOUDINARY_UPLOAD.test(url) || url.includes(`/upload/${TRANSFORMATION}/`)) return url;
  return url.replace(CLOUDINARY_UPLOAD, `$1${TRANSFORMATION}/`);
}
