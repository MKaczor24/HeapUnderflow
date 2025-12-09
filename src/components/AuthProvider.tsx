"use client";

import { useAuthStore } from "@/store/Auth";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { verifySession } = useAuthStore();

  useEffect(() => {
    const checkSession = async () => {
      const toastId = "auth-verify";

      const result = await verifySession();

      if (result.success && result.isNewSession) {
        toast.success("Welcome! You've been signed in successfully.", {
          id: toastId,
          duration: 3000,
        });
      }
    };

    checkSession();
  }, [verifySession]);

  return <>{children}</>;
}
