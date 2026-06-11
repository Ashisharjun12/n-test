import { IUpload } from "./upload.schema.js";
import { PresignedUrlResult } from "../../shared/storage/storage.interface.js";

export type CreateUploadDto = {
  url: string;
  publicId: string;
  originalName: string;
  mimeType?: string;
  size?: number;
  purpose?: "logo" | "signature" | "products" | "attachment" | "other";
};

export interface IUploadRepository {
  create(data: CreateUploadDto): Promise<IUpload>;
  findById(id: string): Promise<IUpload | null>;
  delete(id: string): Promise<void>;
  findAll(purpose?: string): Promise<IUpload[]>;
}

export interface IUploadService {
  requestUploadUrl(filename: string, contentType: string): Promise<PresignedUrlResult>;
  saveFileRecord(data: CreateUploadDto): Promise<IUpload>;
  deleteFile(uploadId: string): Promise<boolean>;
  listFiles(purpose?: string): Promise<IUpload[]>;
}
