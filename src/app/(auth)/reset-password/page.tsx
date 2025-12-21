"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { useAuthStore } from "@/store/Auth";
import { toast } from "react-hot-toast";
import { Input, Button, Label } from "@/components/ui";
import { Spinner } from "@/components/ui/spinner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!userId || !secret) {
      setError("Invalid reset link.");
      return;
    }

    if (!passwords.newPassword || !passwords.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Resetting password...");

    const res = await resetPassword(
      userId,
      secret,
      passwords.newPassword,
      passwords.confirmPassword,
    );

    if (res.success) {
      toast.success("Password reset successfully!", { id: toastId });
      setTimeout(() => router.push("/login"), 2000);
    } else {
      toast.error(res.error?.message || "Failed to reset password", {
        id: toastId,
      });
      setError(res.error?.message || "Failed to reset password");
    }

    setIsLoading(false);
  };

  if (!userId || !secret) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-white">
        <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-950 p-8 shadow-2xl">
          <h1 className="mb-4 text-2xl font-bold">Invalid Reset Link</h1>
          <p className="mb-6 text-neutral-400">
            The password reset link is invalid or has expired.
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="w-full rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-3 font-semibold transition hover:from-blue-600 hover:via-purple-600 hover:to-pink-600"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-950 p-8 text-neutral-50 shadow-2xl">
        <h1 className="mb-2 text-3xl font-bold">Reset Password</h1>
        <p className="mb-8 text-sm text-neutral-400">
          Enter your new password below.
        </p>

        {error && (
          <div className="mb-6 rounded-lg border border-red-800/30 bg-red-950/20 p-4 text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="newPassword" className="text-sm font-medium">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              disabled={isLoading}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              disabled={isLoading}
              className="mt-2"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-3 font-semibold transition hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-50"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Remember your password?{" "}
          <a
            href="/login"
            className="font-semibold text-purple-400 hover:text-purple-300"
          >
            Back to login
          </a>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
