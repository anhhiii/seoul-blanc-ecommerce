import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { BadRequestException } from '../../exceptions/index.js';

export class UploadService {
  constructor() {
    // Configure Cloudinary from environment variables
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Uploads a single file buffer to Cloudinary
   * @param buffer File buffer from Multer memory storage
   * @param folder Target folder name on Cloudinary
   * @returns Secure URL string of the uploaded asset
   */
  public uploadImage = async (buffer: Buffer, folder: string = 'seoul-blanc'): Promise<string> => {
    // Fail-safe check for configuration
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.warn('[Cloudinary Service] Missing credentials, falling back to mock upload.');
      // Return a placeholder or mock URL for developer convenience
      return `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600`;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary upload error]:', error);
            return reject(new BadRequestException('Failed to upload image to Cloudinary'));
          }
          if (!result) {
            return reject(new BadRequestException('Upload returned an empty response'));
          }
          resolve(result.secure_url);
        }
      );

      // Stream the buffer into Cloudinary upload API
      Readable.from(buffer).pipe(uploadStream);
    });
  };

  /**
   * Uploads multiple file buffers to Cloudinary in parallel
   * @param buffers Array of file buffers
   * @param folder Target folder name
   * @returns Array of secure URL strings
   */
  public uploadMultipleImages = async (
    buffers: Buffer[],
    folder: string = 'seoul-blanc'
  ): Promise<string[]> => {
    const uploadPromises = buffers.map((buf) => this.uploadImage(buf, folder));
    return Promise.all(uploadPromises);
  };
}

export default UploadService;
