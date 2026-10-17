import { z } from "zod";

const registerZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "নাম আবশ্যক" }).min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
    email: z.string({ required_error: "ইমেইল আবশ্যক" }).email("সঠিক ইমেইল ঠিকানা দিন"),
    password: z.string({ required_error: "পাসওয়ার্ড আবশ্যক" }).min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
    role: z.enum(["CITIZEN", "BUYER", "LANDOWNER", "REVIEWER"]).optional(),
    phone: z.string().optional(),
  }),
});

const loginZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "ইমেইল আবশ্যক" }).email("সঠিক ইমেইল ঠিকানা দিন"),
    password: z.string({ required_error: "পাসওয়ার্ড আবশ্যক" }),
  }),
});

export const AuthValidation = {
  registerZodSchema,
  loginZodSchema,
};
