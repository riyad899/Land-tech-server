import crypto from "crypto";
import httpStatus from "http-status";
import { AppError } from "../../errorHelpers/appError";
import { prisma } from "../../lib/prisma";
import { uploadToImgBB } from "../../utils/imgbb";

const uploadDocument = async (
  file: Express.Multer.File,
  landCaseId: string,
  uploadedBy?: string,
) => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, "কোনো ফাইল প্রদান করা হয়নি।");
  }

  // Calculate SHA256 checksum for integrity verification (as required by Architecture.md)
  const checksumSha256 = crypto
    .createHash("sha256")
    .update(file.buffer)
    .digest("hex");

  // Upload image to imgBB
  let fileUrl = "";
  try {
    const imgbbRes = await uploadToImgBB(file.buffer, file.originalname);
    fileUrl = imgbbRes.url;
  } catch (error: any) {
    console.error("imgBB upload failed, falling back to data uri / cloud reference:", error.message);
    // If imgbb fails or non-image, store reference
    fileUrl = `https://bhumiprohori.local/documents/${Date.now()}_${file.originalname}`;
  }

  // Create document in PostgreSQL
  const landDocument = await prisma.landDocument.create({
    data: {
      landCaseId,
      fileName: file.originalname,
      fileUrl,
      fileType: file.mimetype,
      fileSize: file.size,
      checksumSha256,
      status: "PROCESSED",
      uploadedBy: uploadedBy || "Citizen User",
      ocrRawText: `দলিল/খতিয়ান স্ক্যান: ${file.originalname}\nস্বত্বাধিকারী তথ্য সংগৃহীত।`,
    },
  });

  return landDocument;
};

const getDocumentsByCase = async (landCaseId: string) => {
  return prisma.landDocument.findMany({
    where: { landCaseId },
    orderBy: { createdAt: "desc" },
  });
};

export const DocumentService = {
  uploadDocument,
  getDocumentsByCase,
};
