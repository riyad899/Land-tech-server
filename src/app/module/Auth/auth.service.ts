import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { AppError } from "../../errorHelpers/appError";
import { prisma } from "../../lib/prisma";
import { redisService } from "../../lib/redis";
import { sendEmail } from "../../utils/email";
import { generateToken, verifyToken } from "../../utils/jwt";

const registerUser = async (payload: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "এই ইমেইল দিয়ে ইতিমধ্যে একটি একাউন্ট খোলা আছে।");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const newUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email.toLowerCase(),
      password: hashedPassword,
      role: payload.role || "CITIZEN",
      phone: payload.phone || null,
      isVerified: true, // Auto verify for ease
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  const accessToken = generateToken(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    envVars.JWT.ACCESS_SECRET as Secret,
    envVars.JWT.ACCESS_EXPIRES_IN,
  );

  return { user: newUser, accessToken };
};

const loginUser = async (payload: any) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

  if (!user || !user.password) {
    throw new AppError(httpStatus.UNAUTHORIZED, "ভুল ইমেইল অথবা পাসওয়ার্ড।");
  }

  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "ভুল ইমেইল অথবা পাসওয়ার্ড।");
  }

  const accessToken = generateToken(
    { id: user.id, email: user.email, role: user.role },
    envVars.JWT.ACCESS_SECRET as Secret,
    envVars.JWT.ACCESS_EXPIRES_IN,
  );

  // Store active session in Redis
  await redisService.set(`session:${user.id}`, { lastLogin: new Date() }, 86400 * 7);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    },
    accessToken,
  };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
      _count: {
        select: {
          cases: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "ব্যবহারকারী পাওয়া যায়নি।");
  }

  return user;
};

const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "এই ইমেইল সংশ্লিষ্ট কোনো একাউন্ট নেই।");
  }

  const resetToken = generateToken(
    { id: user.id, email: user.email },
    envVars.JWT.ACCESS_SECRET as Secret,
    "1h",
  );

  const resetLink = `${envVars.FRONTEND_URL}/resetpass?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
      <h2 style="color: #176B55;">ভূমিপ্রহরী (BhumiProhori) — পাসওয়ার্ড রিসেট অনুরোধ</h2>
      <p>প্রিয় ${user.name},</p>
      <p>আপনার ভূমিপ্রহরী একাউন্টের পাসওয়ার্ড পরিবর্তনের অনুরোধ পাওয়া গেছে। পাসওয়ার্ড রিসেট করতে নিচের বাটনে ক্লিক করুন:</p>
      <div style="margin: 25px 0;">
        <a href="${resetLink}" style="background-color: #176B55; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">পাসওয়ার্ড রিসেট করুন</a>
      </div>
      <p style="color: #777; font-size: 13px;">এই লিঙ্কটি আগামী ১ ঘণ্টার জন্য কার্যকর থাকবে। আপনি যদি এই অনুরোধ না করে থাকেন, তবে বার্তাটি উপেক্ষা করুন।</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: "ভূমিপ্রহরী পাসওয়ার্ড রিসেট লিংক",
    html,
  });

  return { message: "পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।" };
};

const resetPassword = async (token: string, newPassword: string) => {
  const decoded = verifyToken(token, envVars.JWT.ACCESS_SECRET as Secret);
  if (!decoded?.id) {
    throw new AppError(httpStatus.BAD_REQUEST, "অবৈধ বা মেয়াদোত্তীর্ণ টোকেন।");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: decoded.id },
    data: { password: hashedPassword },
  });

  return { message: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।" };
};

const handleGoogleCallback = async (googleProfile: {
  googleId: string;
  name: string;
  email: string;
  avatarUrl?: string;
}) => {
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { googleId: googleProfile.googleId },
        { email: googleProfile.email.toLowerCase() },
      ],
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        googleId: googleProfile.googleId,
        name: googleProfile.name,
        email: googleProfile.email.toLowerCase(),
        avatarUrl: googleProfile.avatarUrl,
        isVerified: true,
        role: "CITIZEN",
      },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: googleProfile.googleId,
        avatarUrl: user.avatarUrl || googleProfile.avatarUrl,
      },
    });
  }

  const accessToken = generateToken(
    { id: user.id, email: user.email, role: user.role },
    envVars.JWT.ACCESS_SECRET as Secret,
    envVars.JWT.ACCESS_EXPIRES_IN,
  );

  return { user, accessToken };
};

export const AuthService = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  handleGoogleCallback,
};
