import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errorHelpers/appError";
import { handleZodError } from "../errorHelpers/handleZodErrors";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong!";
  let errorSources: any[] = [
    {
      path: "",
      message: err.message || "Something went wrong",
    },
  ];

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  } else if (err?.name === "PrismaClientKnownRequestError") {
    statusCode = 400;
    message = `Database Error: ${err.message}`;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: process.env.NODE_ENV === "development" ? err?.stack : null,
  });
};
