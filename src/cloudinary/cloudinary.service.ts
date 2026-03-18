import { Injectable, Inject } from '@nestjs/common';
import { v2 as Cloudinary, UploadApiResponse } from 'cloudinary';
import toStream from 'buffer-to-stream';
import { Writable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor (@Inject('CLOUDINARY') private cloudinary: typeof Cloudinary) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const upload: Writable = this.cloudinary.uploader.upload_stream(
        { resource_type: 'auto'},
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        }
      );
      toStream(file.buffer).pipe(upload);
    })
  }

  async deleteImage(publicId: string): Promise<UploadApiResponse> {
    return this.cloudinary.uploader.destroy(publicId);
  }
};