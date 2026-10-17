import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { DocumentService } from "./document.service";

const uploadDocument = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;
  const landCaseId = req.body.landCaseId;
  const user = (req as any).user;

  if (!landCaseId) {
    return sendResponse(res, {
      httpStatusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "landCaseId আবশ্যক",
    });
  }

  const result = await DocumentService.uploadDocument(
    file as Express.Multer.File,
    landCaseId,
    user?.name || user?.email,
  );

  sendResponse(res, {
    httpStatusCode: httpStatus.CREATED,
    success: true,
    message: "নথি সফলভাবে আপলোড এবং সুরক্ষিত লিংকে রূপান্তরিত হয়েছে।",
    data: result,
  });
});

const getDocumentsByCase = catchAsync(async (req: Request, res: Response) => {
  const { landCaseId } = req.params;
  const result = await DocumentService.getDocumentsByCase(landCaseId);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "নথিপত্র তালিকা পাওয়া গেছে।",
    data: result,
  });
});

export const DocumentController = {
  uploadDocument,
  getDocumentsByCase,
};
