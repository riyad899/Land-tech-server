import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ReportService } from "./report.service";

const getCaseReport = catchAsync(async (req: Request, res: Response) => {
  const { landCaseId } = req.params;
  const result = await ReportService.generateCaseReport(landCaseId);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "ভূমি নথি যাচাই ও ঝুঁকি বিশ্লেষণ প্রতিবেদন সফলভাবে তৈরি হয়েছে।",
    data: result,
  });
});

export const ReportController = {
  getCaseReport,
};
