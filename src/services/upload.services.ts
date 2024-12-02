import { v2 as cloudinary } from "cloudinary";

import Config from "../config";

class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: Config.CLOUD_NAME,
      api_key: Config.API_KEY,
      api_secret: Config.API_SECRET,
    });
  }

  async upload(filePath: string) {
    return await cloudinary.uploader.upload(filePath);
  }
}

export default UploadService;
