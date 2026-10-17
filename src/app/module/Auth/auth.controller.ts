import { Request, Response } from "express";
import httpStatus from "http-status";
import { envVars } from "../../config/env";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AuthService } from "./auth.service";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    httpStatusCode: httpStatus.CREATED,
    success: true,
    message: "একাউন্ট সফলভাবে তৈরি হয়েছে।",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "সফলভাবে লগইন সম্পন্ন হয়েছে।",
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await AuthService.getMe(user.id);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "ব্যবহারকারীর তথ্য পাওয়া গেছে।",
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken");

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "লগআউট সম্পন্ন হয়েছে।",
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const result = await AuthService.resetPassword(token, password);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

// Google OAuth URL redirect
const googleAuthRedirect = (req: Request, res: Response) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: envVars.GOOGLE.CALLBACK_URL,
    client_id: envVars.GOOGLE.CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);
  res.redirect(`${rootUrl}?${qs.toString()}`);
};

// Google OAuth Callback
const googleAuthCallback = catchAsync(async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=GoogleAuthFailed`);
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: envVars.GOOGLE.CLIENT_ID,
        client_secret: envVars.GOOGLE.CLIENT_SECRET,
        redirect_uri: envVars.GOOGLE.CALLBACK_URL,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return res.redirect(`${envVars.FRONTEND_URL}/login?error=InvalidToken`);
    }

    const userProfileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userProfileRes.json();

    const { accessToken } = await AuthService.handleGoogleCallback({
      googleId: profile.id,
      name: profile.name || "Google User",
      email: profile.email,
      avatarUrl: profile.picture,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: envVars.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${envVars.FRONTEND_URL}/auth-callback?token=${accessToken}`);
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.redirect(`${envVars.FRONTEND_URL}/login?error=OAuthException`);
  }
});

export const AuthController = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  googleAuthRedirect,
  googleAuthCallback,
};
