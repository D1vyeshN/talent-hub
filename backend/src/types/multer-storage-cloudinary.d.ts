import { StorageEngine } from 'multer';
import { v2 as cloudinary } from 'cloudinary';

declare module 'multer-storage-cloudinary' {
  interface CloudinaryStorageOptions {
    cloudinary: typeof cloudinary;
    params?: {
      folder?: string;
      allowed_formats?: string[];
      transformation?: any;
      public_id?: string;
      [key: string]: any;
    };
  }

  interface CloudinaryStorage extends StorageEngine {
    _handleFile(
      req: any,
      file: any,
      callback: (error?: any, info?: any) => void
    ): void;
    _removeFile(
      req: any,
      file: any,
      callback: (error: any) => void
    ): void;
  }

  function CloudinaryStorageFactory(options: CloudinaryStorageOptions): CloudinaryStorage;

  export = CloudinaryStorageFactory;
}
