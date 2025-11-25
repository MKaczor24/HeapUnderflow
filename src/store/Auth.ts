import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { AppwriteException, ID, Models } from "appwrite";
import { account } from "@/models/client/config";

export interface UserPrefs {
  theme: "light" | "dark";
  bio: string;
  reputation: number;
}

interface IAuthStore {
  session: Models.Session | null;
  jwt: string | null;
  user: Models.User<UserPrefs> | null;
  hydrated: boolean;

  setHydrated(): void;
  verifySession(): Promise<void>;
  login(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    error?: AppwriteException | null;
  }>;
  createAccount(
    name: string,
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    error?: AppwriteException | null;
  }>;
  logout(): Promise<void>;
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

      async verifySession() {
        try {
          const session = await account.getSession("current");
          set({ session });
        } catch (error) {
          console.error("Error verifying session:", error);
        }
      },

      async login(email: string, password: string) {
        try {
          const session = await account.createEmailPasswordSession(
            email,
            password
          );
          const [user, jwtResp] = await Promise.all([
            account.get<UserPrefs>(),
            account.createJWT(),
          ]);

          if (user.prefs?.reputation == null) {
            const defaultPrefs: UserPrefs = {
              reputation: 0,
              theme: "light",
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
          await account.create(ID.unique(), email, password, name);
          return { success: true };
        } catch (error) {
          console.error("Account creation error:", error);
          return { success: false, error: error as AppwriteException | null };
        }
      },

      async logout() {
        try {
          await account.deleteSessions();
          set({ session: null, jwt: null, user: null });
        } catch (error) {
          console.error("Logout error:", error);
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
    }
  )
);
