import { z } from "zod";

// ==========================================
// 1. USER ROLES & TYPES
// ==========================================

export type UserRole = "SUPER_ADMIN" | "STORE_MANAGER" | "MARKETING" | "SUPPORT" | "CUSTOMER";

export const ADMIN_ROLES: UserRole[] = ["SUPER_ADMIN", "STORE_MANAGER", "MARKETING", "SUPPORT"];

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: AuthUser;
    requires2FA?: boolean;
    tempToken?: string;
  };
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// ==========================================
// 2. AUTH VALIDATION SCHEMAS
// ==========================================

const passwordRules = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordRules,
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: passwordRules,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const verify2FASchema = z.object({
  code: z.string().length(6, "2FA code must be exactly 6 digits").regex(/^\d+$/, "2FA code must contain only numbers"),
});

export const twoFactorLoginSchema = z.object({
  tempToken: z.string().min(1, "Temporary 2FA token is required"),
  code: z.string().min(6, "Code or recovery code is required"),
});

export const socialLoginSchema = z.object({
  provider: z.enum(["google", "facebook", "apple", "github"]),
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().optional(),
  token: z.string().optional(),
  providerId: z.string().optional(),
});

export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const disable2FASchema = z.object({
  password: z.string().min(1, "Current password is required"),
});

// ==========================================
// 3. PRODUCT VALIDATION
// ==========================================

export const productValidationSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  price: z.number().positive("Price must be a positive number"),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
  description: z.string().optional(),
});

// ==========================================
// 4. INFERRED TYPES
// ==========================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type Verify2FAInput = z.infer<typeof verify2FASchema>;
export type TwoFactorLoginInput = z.infer<typeof twoFactorLoginSchema>;
export type SocialLoginInput = z.infer<typeof socialLoginSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type Disable2FAInput = z.infer<typeof disable2FASchema>;
export type ProductInput = z.infer<typeof productValidationSchema>;

// ==========================================
// 5. UTILITY CONSTANTS
// ==========================================

export const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

export const PAYMENT_METHODS = [
  "STRIPE",
  "PAYPAL",
  "COD",
  "BANK_TRANSFER",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
