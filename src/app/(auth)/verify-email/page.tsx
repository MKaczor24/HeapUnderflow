"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/Auth";
import { toast } from "react-hot-toast";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { verifyEmail } = useAuthStore();
  const [status, setStatus] = useState("Verifying...");

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  useEffect(() => {
    if (userId && secret) {
      const toastId = toast.loading("Verifying your email...");
      verifyEmail(userId, secret).then((res) => {
        if (res.success) {
          setStatus("Email verified successfully!");
          toast.success("Email verified!", { id: toastId });
          setTimeout(() => router.push("/"), 2000);
        } else {
          setStatus("Verification failed.");
          toast.error(res.error?.message || "Verification failed", {
            id: toastId,
          });
        }
      });
    }
  }, [userId, secret, verifyEmail, router]);

  if (!userId || !secret) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        <h1 className="text-2xl">Invalid verification link.</h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center text-white">
      <h1 className="text-2xl">{status}</h1>
    </div>
  );
}
