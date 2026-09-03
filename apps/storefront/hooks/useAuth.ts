import { create } from "zustand";
import { api } from "../lib/api";

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isEmailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requires2FA: boolean;
  tempToken: string | null;
  fetchMe: () => Promise<User | null>;
  login: (credentials: { email: string; password: string }) => Promise<{ user?: User; requires2FA?: boolean }>;
  verify2FALogin: (code: string) => Promise<User>;
  socialLogin: (data: {
    provider: "google" | "facebook" | "apple" | "github";
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }) => Promise<User>;
  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  clearError: () => void;
  reset2FAState: () => void;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (data: { token: string; newPassword: string }) => Promise<string>;
  verifyEmail: (token: string) => Promise<string>;
  resendVerification: (email: string) => Promise<string>;
  setup2FA: () => Promise<{ secret: string; otpauthUrl: string; qrCodeUrl: string }>;
  verify2FA: (code: string) => Promise<{ twoFactorEnabled: boolean; backupCodes: string[] }>;
  disable2FA: (password: string) => Promise<string>;
  updateProfile: (data: Partial<User>) => Promise<User>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  requires2FA: false,
  tempToken: null,

  clearError: () => set({ error: null }),
  reset2FAState: () => set({ requires2FA: false, tempToken: null }),

  fetchMe: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: { user: User } }>("/auth/me");
      if (response.success && response.data?.user) {
        set({ user: response.data.user, isAuthenticated: true, isLoading: false });
        return response.data.user;
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null, requires2FA: false, tempToken: null });
    try {
      const response = await api.post<{
        success: boolean;
        data: { user?: User; requires2FA?: boolean; tempToken?: string };
        message: string;
      }>("/auth/login", credentials);

      if (response.data?.requires2FA && response.data?.tempToken) {
        set({
          requires2FA: true,
          tempToken: response.data.tempToken,
          isLoading: false,
        });
        return { requires2FA: true };
      }

      const user = response.data.user!;
      set({ user, isAuthenticated: true, isLoading: false });
      return { user };
    } catch (err: any) {
      const message = err.message || "Failed to log in";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  verify2FALogin: async (code: string) => {
    const { tempToken } = get();
    if (!tempToken) {
      throw new Error("2FA session expired. Please log in again.");
    }

    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{
        success: boolean;
        data: { user: User; usedBackupCode?: boolean };
        message: string;
      }>("/auth/2fa/login-challenge", {
        tempToken,
        code,
      });

      const user = response.data.user;
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        requires2FA: false,
        tempToken: null,
      });
      return user;
    } catch (err: any) {
      const message = err.message || "Invalid 2FA code";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  socialLogin: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{
        success: boolean;
        data: { user: User };
        message: string;
      }>("/auth/social-login", data);

      const user = response.data.user;
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err: any) {
      const message = err.message || "Failed to sign in with social provider";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ success: boolean; data: { user: User }; message: string }>(
        "/auth/register",
        data
      );
      const user = response.data.user;
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err: any) {
      const message = err.message || "Failed to register";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post("/auth/logout");
    } catch {
      // clear local state regardless
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        requires2FA: false,
        tempToken: null,
      });
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ success: boolean; message: string }>("/auth/forgot-password", { email });
      set({ isLoading: false });
      return response.message || "Reset link sent if email exists.";
    } catch (err: any) {
      const message = err.message || "Failed to submit password reset request";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  resetPassword: async (data: { token: string; newPassword: string }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ success: boolean; message: string }>("/auth/reset-password", data);
      set({ isLoading: false });
      return response.message || "Password has been successfully reset.";
    } catch (err: any) {
      const message = err.message || "Failed to reset password";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  verifyEmail: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ success: boolean; message: string }>("/auth/verify-email", { token });
      set((state) => ({
        isLoading: false,
        user: state.user ? { ...state.user, isEmailVerified: true } : null,
      }));
      return response.message || "Email verified successfully.";
    } catch (err: any) {
      const message = err.message || "Failed to verify email";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  resendVerification: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ success: boolean; message: string }>("/auth/resend-verification", { email });
      set({ isLoading: false });
      return response.message || "Verification link sent.";
    } catch (err: any) {
      const message = err.message || "Failed to resend verification email";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  setup2FA: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{
        success: boolean;
        data: { secret: string; otpauthUrl: string; qrCodeUrl: string };
      }>("/auth/2fa/setup");
      set({ isLoading: false });
      return response.data;
    } catch (err: any) {
      const message = err.message || "Failed to setup 2FA";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  verify2FA: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{
        success: boolean;
        data: { twoFactorEnabled: boolean; backupCodes: string[] };
      }>("/auth/2fa/verify", { code });
      set((state) => ({
        isLoading: false,
        user: state.user ? { ...state.user, twoFactorEnabled: true } : null,
      }));
      return response.data;
    } catch (err: any) {
      const message = err.message || "Failed to verify 2FA code";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  disable2FA: async (password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ success: boolean; message: string }>("/auth/2fa/disable", { password });
      set((state) => ({
        isLoading: false,
        user: state.user ? { ...state.user, twoFactorEnabled: false } : null,
      }));
      return response.message || "Two-factor authentication disabled.";
    } catch (err: any) {
      const message = err.message || "Failed to disable 2FA";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put<{ success: boolean; data: User }>("/customer/profile", data);
      const updatedUser = response.data;
      set({ user: updatedUser, isLoading: false });
      return updatedUser;
    } catch (err: any) {
      const message = err.message || "Failed to update profile";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },
}));
