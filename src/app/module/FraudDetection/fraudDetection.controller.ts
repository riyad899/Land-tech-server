import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { FraudDetectionService } from "./fraudDetection.service";

const analyzeCase = catchAsync(async (req: Request, res: Response) => {
  const { landCaseId } = req.params;
  const result = await FraudDetectionService.analyzeCase(landCaseId);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "জমির নথি যাচাই এবং প্রতারণার ঝুঁকি মূল্যায়ন সফলভাবে সম্পন্ন হয়েছে।",
    data: result,
  });
});

export const FraudDetectionController = {
  analyzeCase,
};
