import { Request, Response } from "express";
import httpStatus from "http-status";

export const notFound = (req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API Route Not Found!",
    error: {
      path: req.originalUrl,
      message: "The requested path could not be found on this server.",
    },
  });
};
