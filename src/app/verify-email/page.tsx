"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useAuthStore } from "@/store/Auth";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";

function VerifyEmailComponent() {
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
      <div className="flex items-center justify-center text-neutral-50">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl">
          <h1 className="text-2xl">Invalid verification link.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center text-neutral-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl">
        <h1 className="text-2xl">{status}</h1>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <VerifyEmailComponent />
    </Suspense>
  );
}
