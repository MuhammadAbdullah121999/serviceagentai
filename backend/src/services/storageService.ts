import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const isStorageConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

export interface UploadResult {
  storageKey: string;
  url: string;
  bytes: number;
}

/**
 * Cloudinary splits uploads by resource_type. 'raw' covers documents and
 * anything it can't render; 'image' and 'video' get transformations.
 */
const resourceTypeFor = (mime: string): 'image' | 'video' | 'raw' => {
  if (mime.startsWith('image/') && mime !== 'image/svg+xml') return 'image';
  if (mime.startsWith('video/') || mime.startsWith('audio/')) return 'video';
  return 'raw';
};

export const uploadBuffer = (
  buffer: Buffer,
  opts: { userId: string; requestId: string; filename: string; mimeType: string }
): Promise<UploadResult> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `servicepilot/${opts.userId}/${opts.requestId}`,
        resource_type: resourceTypeFor(opts.mimeType),
        // keep the original name visible but let Cloudinary guarantee uniqueness
        public_id: opts.filename.replace(/\.[^.]+$/, '').slice(0, 80),
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (err, result) => {
        if (err || !result) {
          return reject(new Error(err?.message || 'Upload to storage failed'));
        }
        resolve({
          storageKey: `${result.resource_type}:${result.public_id}`,
          url: result.secure_url,
          bytes: result.bytes,
        });
      }
    );
    stream.end(buffer);
  });

export const deleteFromStorage = async (storageKey: string) => {
  const [resourceType, ...rest] = storageKey.split(':');
  const publicId = rest.join(':');
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: (resourceType as any) || 'raw',
    });
  } catch {
    // Storage cleanup is best-effort. A stale remote file is preferable to
    // leaving an orphan row the user can still see but never remove.
  }
};

/** Small transform for image previews. Non-images get their original URL. */
export const thumbnailUrl = (storageKey: string, url: string) => {
  if (!storageKey.startsWith('image:')) return null;
  return url.replace('/upload/', '/upload/c_fill,w_200,h_200,q_auto,f_auto/');
};