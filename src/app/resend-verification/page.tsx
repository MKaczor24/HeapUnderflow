"use client";

import { useAuthStore } from "@/store/Auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { IconMail, IconCheck, IconAlertCircle } from "@tabler/icons-react";

export default function ResendVerificationPage() {
  const { session, sendVerificationEmail } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  const handleResend = async () => {
    setLoading(true);
    setError("");
    const res = await sendVerificationEmail();
    setLoading(false);
    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error?.message || "Failed to send verification email.");
    }
  };

  if (!session) return null;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-purple-500/10 p-4">
            <IconMail className="h-12 w-12 text-purple-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-50">
            Resend Verification
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Click the button below to receive a new verification email.
          </p>
        </div>

        {success ? (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-center text-green-500">
            <div className="flex flex-col items-center gap-2">
              <IconCheck className="h-8 w-8" />
              <p className="font-medium">Email sent successfully!</p>
              <p className="text-xs text-neutral-400">
                Please check your inbox and spam folder.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
                <IconAlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <Button
              onClick={handleResend}
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 py-6 text-lg font-semibold text-neutral-50 shadow-lg shadow-neutral-950 transition duration-300 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-inner disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner className="h-5 w-5 border-neutral-50 border-t-transparent" />
                  Sending...
                </span>
              ) : (
                "Send Verification Email"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
