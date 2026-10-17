import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { LandCaseService } from "./case.service";

const createCase = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await LandCaseService.createCase(req.body, user?.id);

  sendResponse(res, {
    httpStatusCode: httpStatus.CREATED,
    success: true,
    message: "নতুন ভূমি যাচাই কেস সফলভাবে নথিভুক্ত হয়েছে।",
    data: result,
  });
});

const getAllCases = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await LandCaseService.getAllCases(user?.id);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "ভূমি যাচাই কেস তালিকা পাওয়া গেছে।",
    data: result,
  });
});

const getCaseById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await LandCaseService.getCaseById(id);

  if (!result) {
    return sendResponse(res, {
      httpStatusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "কেসটি খুঁজে পাওয়া যায়নি।",
    });
  }

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "কেসের বিস্তারিত তথ্য পাওয়া গেছে।",
    data: result,
  });
});

const updateCase = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await LandCaseService.updateCase(id, req.body);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "কেসের তথ্য হালনাগাদ করা হয়েছে।",
    data: result,
  });
});

const deleteCase = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await LandCaseService.deleteCase(id);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "কেস সফলভাবে মুছে ফেলা হয়েছে।",
    data: result,
  });
});

export const LandCaseController = {
  createCase,
  getAllCases,
  getCaseById,
  updateCase,
  deleteCase,
};
