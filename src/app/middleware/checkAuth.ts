import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import { envVars } from "../config/env";
import { AppError } from "../errorHelpers/appError";
import { prisma } from "../lib/prisma";
import { verifyToken } from "../utils/jwt";

export const checkAuth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken;

      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, "আপনি লগইন করেননি। অনুগ্রহ করে লগইন করুন।");
      }

      let verifiedUser: any;
      try {
        verifiedUser = verifyToken(token, envVars.JWT.ACCESS_SECRET as Secret);
      } catch (err) {
        throw new AppError(httpStatus.UNAUTHORIZED, "অবৈধ বা মেয়াদোত্তীর্ণ লগইন টোকেন।");
      }

      const user = await prisma.user.findUnique({
        where: { id: verifiedUser.id },
      });

      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "ব্যবহারকারী খুঁজে পাওয়া যায়নি।");
      }

      if (roles.length && !roles.includes(user.role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "এই কার্য সম্পাদনের জন্য আপনার অনুমতি নেই।",
        );
      }

      (req as any).user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};
