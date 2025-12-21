"use client";

import { useAuthStore } from "@/store/Auth";
import { useState } from "react";
import { Input, Label, Button, ShineBorder } from "@/components/ui/index";
import LabelInputContainer from "@/components/LabelInputContainer";
import { IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const { sendPasswordRecoveryEmail } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Sending recovery email...");

    const response = await sendPasswordRecoveryEmail(email);

    if (response.success) {
      toast.success("Recovery email sent! Check your inbox.", { id: toastId });
    } else {
      toast.error(response.error?.message || "Failed to send email", {
        id: toastId,
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-50/10 bg-neutral-900/80 p-8 text-neutral-50 shadow-2xl backdrop-blur-xl">
        <ShineBorder
          className="absolute inset-0"
          shineColor={["#3B82F6", "#8B5CF6", "#EC4899", "#3B82F6"]}
        />

        <div className="relative z-10 mb-8 text-center">
          <h1 className="text-3xl font-bold text-neutral-50">Reset Password</h1>
          <p className="mt-2 text-neutral-400">
            Enter your email to receive a password reset link
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative z-10 flex flex-col gap-4"
        >
          <LabelInputContainer>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              placeholder="imagine@zapomniec.com"
              type="email"
            />
          </LabelInputContainer>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 py-3 text-lg font-semibold text-neutral-50 shadow-lg shadow-neutral-950 transition duration-300 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-inner disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <IconLoader2 className="h-5 w-5 animate-spin" />
                <span>Sending...</span>
              </span>
            ) : (
              "Send Recovery Link"
            )}
          </Button>
        </form>

        <p className="relative z-10 mt-6 text-center text-sm text-neutral-400">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-purple-400 transition hover:text-purple-300 hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
