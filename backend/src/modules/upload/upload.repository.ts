import { Upload, IUpload } from "./upload.schema.js";
import { CreateUploadDto, IUploadRepository } from "./upload.interface.js";

export class UploadRepository implements IUploadRepository {
  async create(data: CreateUploadDto): Promise<IUpload> {
    const upload = new Upload(data);
    return upload.save();
  }

  async findById(id: string): Promise<IUpload | null> {
    return Upload.findById(id).lean<IUpload>();
  }

  async delete(id: string): Promise<void> {
    await Upload.findByIdAndDelete(id);
  }

  async findAll(purpose?: string): Promise<IUpload[]> {
    const filter: any = purpose ? { purpose } : {};
    return Upload.find(filter).sort({ createdAt: -1 }).lean<IUpload[]>();
  }
}
