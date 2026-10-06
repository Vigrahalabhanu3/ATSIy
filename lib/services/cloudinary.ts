import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export interface UploadResult {
  fileUrl: string;
  publicId?: string;
}

export async function uploadToCloudinary(
  buffer: Buffer,
  fileName: string,
  folderOrType?: string
): Promise<UploadResult> {
  const safeName = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const folder = folderOrType && folderOrType.includes("/") ? folderOrType : "atsly_resumes";

  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder,
          public_id: `${Date.now()}_${safeName}`,
        },
        (error: any, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            return reject(new Error(`Cloudinary upload failed: ${error?.message || "Unknown error"}`));
          }
          resolve({
            fileUrl: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  // Graceful fallback for development if Cloudinary credentials are not set yet:
  const isPdf = safeName.toLowerCase().endsWith(".pdf");
  const mimeType = isPdf
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const base64Data = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  return {
    fileUrl: dataUrl,
    publicId: `local_${Date.now()}_${safeName}`,
  };
}

export async function deleteFromCloudinary(publicId?: string): Promise<boolean> {
  if (!publicId) return true;

  if (isCloudinaryConfigured && !publicId.startsWith("local_")) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
      return true;
    } catch (error) {
      console.error("Failed to delete file from Cloudinary:", error);
      return false;
    }
  }

  return true;
}

export const uploadResumeFile = uploadToCloudinary;
export const deleteResumeFile = deleteFromCloudinary;
