"use client";

import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input, Label, Button, ShineBorder } from "@/components/ui/index";
import LabelInputContainer from "@/components/LabelInputContainer";
import { OAuthProvider } from "appwrite";
import { account } from "@/models/client/config";
import {
  IconBrandGoogle,
  IconBrandGithub,
  IconEye,
  IconEyeOff,
  IconLoader2,
} from "@tabler/icons-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { createAccount, login, sendVerificationEmail } = useAuthStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string | null;
    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;

    if (!username || !email || !password) {
      toast.error("Please fill all the fields first.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Creating your account...");

    try {
      const response = await createAccount(
        username.toString(),
        email.toString(),
        password.toString(),
      );

      if (response.error) {
        toast.error(response.error.message, { id: toastId });
        setIsLoading(false);
        return;
      }

      toast.loading("Logging you in...", { id: toastId });

      const loginResponse = await login(email.toString(), password.toString());

      await sendVerificationEmail();

      if (loginResponse.error) {
        toast.error(loginResponse.error.message, { id: toastId });
        router.push("/login");
      } else {
        toast.success(
          "Welcome to HeapUnderflow! Email verification link has been sent to your email.",
          { id: toastId },
        );
        router.push("/");
      }
    } catch {
      toast.error("Something went wrong. Please try again.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = () => {
    sessionStorage.setItem("oauth_redirect", "true");
    toast.loading("Redirecting to Google...", {
      id: "oauth-redirect",
      duration: 2000,
    });
    account.createOAuth2Session(
      OAuthProvider.Google,
      `${window.location.origin}/`,
      `${window.location.origin}/register`,
    );
  };

  const loginWithGithub = () => {
    sessionStorage.setItem("oauth_redirect", "true");
    toast.loading("Redirecting to GitHub...", {
      id: "oauth-redirect",
      duration: 2000,
    });
    account.createOAuth2Session(
      OAuthProvider.Github,
      `${window.location.origin}/`,
      `${window.location.origin}/register`,
    );
  };

  return (
    <div className="flex w-full flex-col items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-50/10 bg-neutral-900/80 p-8 text-neutral-50 shadow-2xl backdrop-blur-xl">
        <ShineBorder
          className="absolute inset-0"
          shineColor={["#3B82F6", "#8B5CF6", "#EC4899", "#3B82F6"]}
        />

        <div className="relative z-10 mb-8 text-center">
          <h1 className="text-3xl font-bold text-neutral-50">Create Account</h1>
          <p className="mt-2 text-neutral-400">
            Join the HeapUnderflow community
          </p>
        </div>

        <div className="relative z-10 mb-6 flex gap-4">
          <button
            type="button"
            onClick={loginWithGoogle}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-50 transition duration-300 hover:border-neutral-500 hover:bg-neutral-700"
          >
            <IconBrandGoogle className="h-5 w-5" />
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={loginWithGithub}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-50 transition duration-300 hover:border-neutral-500 hover:bg-neutral-700"
          >
            <IconBrandGithub className="h-5 w-5" />
            <span>GitHub</span>
          </button>
        </div>

        <div className="relative z-10 mb-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-neutral-700" />
          <span className="text-sm text-neutral-500">
            or register with email
          </span>
          <div className="h-px flex-1 bg-neutral-700" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative z-10 flex flex-col gap-4"
        >
          <LabelInputContainer>
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              name="username"
              id="username"
              placeholder="WalkowiakPTC"
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              name="email"
              id="email"
              placeholder="U2tonieUZ@gmail.com"
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label htmlFor="password">Password</Label>
            <div className="relative w-full">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-200"
              >
                {showPassword ? (
                  <IconEyeOff className="h-5 w-5" />
                ) : (
                  <IconEye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Must be at least 8 characters
            </p>
          </LabelInputContainer>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 py-3 text-lg font-semibold text-neutral-50 shadow-lg shadow-neutral-950 transition duration-300 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-inner disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <IconLoader2 className="h-5 w-5 animate-spin" />
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <p className="relative z-10 mt-6 text-center text-sm text-neutral-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-purple-400 transition hover:text-purple-300 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
