import { storageProvider } from "../../shared/storage/storage.factory.js";
import { PresignedUrlResult, MultipartUploadStartResult } from "../../shared/storage/storage.interface.js";

export class StorageService {
    
    // Core Interface (delete)
    static async deleteFile(publicId: string): Promise<void> {
        return storageProvider.delete(publicId);
    }

    // get presigned upload url
    static async getPresignedUploadUrl(filename: string, contentType: string): Promise<PresignedUrlResult> {
        if (!storageProvider.getPresignedUploadUrl) {
            throw new Error("Current storage provider does not support presigned upload URLs");
        }
        return storageProvider.getPresignedUploadUrl(filename, contentType);
    }

    // get presigned download url
    static async getPresignedDownloadUrl(key: string): Promise<string> {
        if (!storageProvider.getPresignedDownloadUrl) {
            throw new Error("Current storage provider does not support presigned download URLs");
        }
        return storageProvider.getPresignedDownloadUrl(key);
    }

    // Multipart
    static async startMultipartUpload(filename: string, contentType: string): Promise<MultipartUploadStartResult> {
        if (!storageProvider.startMultipartUpload) {
            throw new Error("Current storage provider does not support multipart uploads");
        }
        return storageProvider.startMultipartUpload(filename, contentType);
    }

    // get multipart part url
    static async getMultipartPartUrl(key: string, uploadId: string, partNumber: number): Promise<string> {
        if (!storageProvider.getMultipartPartUrl) {
            throw new Error("Current storage provider does not support multipart uploads");
        }
        return storageProvider.getMultipartPartUrl(key, uploadId, partNumber);
    }

    // complete multipart upload
    static async completeMultipartUpload(key: string, uploadId: string, parts: any[]): Promise<void> {
        if (!storageProvider.completeMultipartUpload) {
            throw new Error("Current storage provider does not support multipart uploads");
        }
        return storageProvider.completeMultipartUpload(key, uploadId, parts);
    }

}
