import { IStorageProvider } from "./storage.interface.js";
import { _config } from "../../config/config.js";
import { CloudinaryProvider } from "./provider/cloudinary.provider.js";
import { R2Provider } from "./provider/r2.provider.js";
// Future: import { S3Provider } from "./provider/s3.provider.js";

type ProviderName = "cloudinary" | "s3" | "r2";

class StorageFactory {
  private static provider: IStorageProvider | null = null;

  static getProvider(name: ProviderName = "r2"): IStorageProvider {
    if (this.provider) return this.provider;

    switch (name) {
      case "cloudinary":
        this.provider = new CloudinaryProvider();
        break;
      // case "s3":
      //   this.provider = new S3Provider();
      //   break;
      case "r2":
        this.provider = new R2Provider();
        break;
      default:
        throw new Error(`Unknown storage provider: ${name}`);
    }

    return this.provider;
  }
}

const providerName = (_config.STORAGE_PROVIDER || "r2") as ProviderName;
export const storageProvider = StorageFactory.getProvider(providerName);
