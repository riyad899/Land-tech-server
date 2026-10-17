import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { LandRecordService } from "./record.service";

const addRecord = catchAsync(async (req: Request, res: Response) => {
  const result = await LandRecordService.addRecord(req.body);

  sendResponse(res, {
    httpStatusCode: httpStatus.CREATED,
    success: true,
    message: "জরিপ রেকর্ড সফলভাবে যুক্ত হয়েছে।",
    data: result,
  });
});

const addDeed = catchAsync(async (req: Request, res: Response) => {
  const result = await LandRecordService.addDeed(req.body);

  sendResponse(res, {
    httpStatusCode: httpStatus.CREATED,
    success: true,
    message: "দলিলের তথ্য সফলভাবে যুক্ত হয়েছে।",
    data: result,
  });
});

const getRecordsByCase = catchAsync(async (req: Request, res: Response) => {
  const { landCaseId } = req.params;
  const result = await LandRecordService.getRecordsByCase(landCaseId);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "রেকর্ড ও দলিলের তালিকা পাওয়া গেছে।",
    data: result,
  });
});

export const LandRecordController = {
  addRecord,
  addDeed,
  getRecordsByCase,
};
