import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { AppwriteException, ID, Models } from "appwrite";
import { account } from "@/models/client/config";
import axios from "axios";

export interface UserPrefs {
  theme: "light" | "dark";
  bio: string;
  reputation: number;
  avatarId: string;
}

interface IAuthStore {
  session: Models.Session | null;
  jwt: string | null;
  user: Models.User<UserPrefs> | null;
  hydrated: boolean;

  setHydrated(): void;
  verifySession(): Promise<{ success: boolean; isNewSession: boolean }>;
  login(
    email: string,
    password: string,
  ): Promise<{
    success: boolean;
    error?: AppwriteException | null;
  }>;
  createAccount(
    name: string,
    email: string,
    password: string,
  ): Promise<{
    success: boolean;
    error?: AppwriteException | null;
  }>;
  logout(): Promise<void>;
  sendVerificationEmail(): Promise<{
    success: boolean;
    error?: AppwriteException | null;
  }>;
  verifyEmail(
    userId: string,
    secret: string,
  ): Promise<{
    success: boolean;
    error?: AppwriteException | null;
  }>;
  sendPasswordRecoveryEmail(email: string): Promise<{
    success: boolean;
    error?: AppwriteException | null;
  }>;
  resetPassword(
    userId: string,
    secret: string,
    newPassword: string,
    newPasswordAgain: string,
  ): Promise<{
    success: boolean;
    error?: AppwriteException | null;
  }>;
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    immer((set) => ({
      session: null,
      jwt: null,
      user: null,
      hydrated: false,

      setHydrated() {
        set({ hydrated: true });
      },

      async verifySession(): Promise<{
        success: boolean;
        isNewSession: boolean;
      }> {
        try {
          const session = await account.getSession("current");
          const [user, jwtResp] = await Promise.all([
            account.get<UserPrefs>(),
            account.createJWT(),
          ]);

          if (user.prefs?.reputation == null) {
            const defaultPrefs: UserPrefs = {
              reputation: 0,
              theme: "dark",
              bio: "",
            };
            await account.updatePrefs<UserPrefs>(defaultPrefs);
            user.prefs = defaultPrefs;
          }

          const isOAuthRedirect =
            typeof window !== "undefined" &&
            sessionStorage.getItem("oauth_redirect") === "true";

          if (isOAuthRedirect) {
            sessionStorage.removeItem("oauth_redirect");
          }

          set({ session, user, jwt: jwtResp.jwt });

          return { success: true, isNewSession: isOAuthRedirect };
        } catch {
          set({ session: null, user: null, jwt: null });
          return { success: false, isNewSession: false };
        }
      },

      async login(email: string, password: string) {
        try {
          const session = await account.createEmailPasswordSession(
            email,
            password,
          );
          const [user, jwtResp] = await Promise.all([
            account.get<UserPrefs>(),
            account.createJWT(),
          ]);

          if (user.prefs?.reputation == null) {
            const defaultPrefs: UserPrefs = {
              reputation: 0,
              theme: "dark",
              bio: "",
            };
            await account.updatePrefs<UserPrefs>(defaultPrefs);
            user.prefs = defaultPrefs;
          }

          set({ session, jwt: jwtResp.jwt, user });

          return { success: true };
        } catch (error) {
          console.error("Login error:", error);
          return { success: false, error: error as AppwriteException | null };
        }
      },

      async createAccount(name: string, email: string, password: string) {
        try {
          await axios.post("/api/auth/register", { name, email, password });
          return { success: true };
        } catch (error: any) {
          console.error("Account creation error:", error);
          return {
            success: false,
            error: error?.response?.data?.error || error,
          };
        }
      },

      async logout() {
        try {
          const currentSession = await account
            .getSession("current")
            .catch(() => null);
          if (currentSession) {
            await account.deleteSessions();
          }
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({ session: null, jwt: null, user: null });
        }
      },

      async sendVerificationEmail() {
        try {
          await account.createVerification(
            `${window.location.origin}/verify-email`,
          );
          return { success: true };
        } catch (error) {
          console.error("Send verification email error:", error);
          return { success: false, error: error as AppwriteException | null };
        }
      },

      async verifyEmail(userId: string, secret: string) {
        try {
          await account.updateVerification(userId, secret);
          return { success: true };
        } catch (error) {
          console.error("Verify email error:", error);
          return { success: false, error: error as AppwriteException | null };
        }
      },

      async sendPasswordRecoveryEmail(email: string) {
        try {
          await account.createRecovery(
            email,
            `${window.location.origin}/reset-password`,
          );
          return { success: true };
        } catch (error) {
          console.error("Send password recovery email error:", error);
          return { success: false, error: error as AppwriteException | null };
        }
      },

      async resetPassword(userId: string, secret: string, newPassword: string) {
        try {
          await account.updateRecovery(userId, secret, newPassword);
          return { success: true };
        } catch (error) {
          console.error("Reset password error", error);
          return { success: false, error: error as AppwriteException | null };
        }
      },
    })),
    {
      name: "auth",
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          state?.setHydrated();
        }
      },
    },
  ),
);
