import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { RAGService } from "./rag.service";

const ragService = new RAGService();

const getStats = catchAsync(async (req: Request, res: Response) => {
  const result = await ragService.getStats();

  sendResponse(res, {
    success: true,
    httpStatusCode: httpStatus.OK,
    message: "RAG পরিসংখ্যান সফলভাবে পাওয়া গেছে।",
    data: result,
  });
});

const getPopularQuestions = catchAsync(async (req: Request, res: Response) => {
  const result = await ragService.getPopularQuestions();

  sendResponse(res, {
    success: true,
    httpStatusCode: httpStatus.OK,
    message: "জনপ্রিয় আইনি প্রশ্নাবলী সফলভাবে পাওয়া গেছে (Redis ১ ঘণ্টা ক্যাশ)।",
    data: result,
  });
});

const ingestLegalData = catchAsync(async (req: Request, res: Response) => {
  const result = await ragService.ingestLegalData();

  sendResponse(res, {
    success: true,
    httpStatusCode: httpStatus.OK,
    message: "আইনি ও জরিপ তথ্যের ভেক্টর ইনডেক্সিং সফলভাবে সম্পন্ন হয়েছে।",
    data: result,
  });
});

const queryRag = catchAsync(async (req: Request, res: Response) => {
  const { query, limit, sourceType, asJson } = req.body;

  if (!query) {
    return sendResponse(res, {
      success: false,
      httpStatusCode: httpStatus.BAD_REQUEST,
      message: "Query is required",
    });
  }

  const userIdentifier =
    (req as any).user?.id ||
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "anonymous";

  const result = await ragService.generateAnswer(
    query,
    limit ?? 5,
    sourceType,
    asJson ?? false,
    String(userIdentifier),
  );

  sendResponse(res, {
    success: true,
    httpStatusCode: httpStatus.OK,
    message: result.fromCache
      ? "রেডিস ক্যাশ হতে দ্রুত উত্তর প্রদান করা হয়েছে।"
      : "এআই পরামর্শ সফলভাবে প্রদান করা হয়েছে।",
    data: result,
  });
});

export const RagController = {
  getStats,
  getPopularQuestions,
  ingestLegalData,
  queryRag,
};
