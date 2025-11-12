import { z } from "zod";
import { Role } from "@mengo/database";

export const requestOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const requestOtpResponseSchema = z.object({
  message: z.string(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const verifyOtpResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().nullable(),
    avatar: z.string().nullable().optional(),
    role: z.nativeEnum(Role),
  }),
});

export const authInfoResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatar: z.string().nullable().optional(),
  role: z.nativeEnum(Role),
});

export const logoutResponseSchema = z.object({
  message: z.string(),
});

export const authApiErrorPayloadSchema = z.object({
  statusCode: z.number().optional(),
  message: z.union([z.string(), z.array(z.string())]).optional(),
  error: z.string().optional(),
});

