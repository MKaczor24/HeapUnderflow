"use client";

import QuestionForm from "@/components/QuestionForm";
import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AskQuestionPage() {
  const { session, hydrated, checkVerified } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !session) {
      router.push("/login");
    }
  }, [session, hydrated, router]);

  if (!hydrated || !session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!checkVerified()) {
    return (
      <div className="container mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-neutral-50">
            Email Verification Required
          </h1>
          <p className="text-lg text-neutral-400">
            You need to verify your email address before you can ask questions.
          </p>
        </div>
        <Link href="/resend-verification">
          <Button className="rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 px-8 py-3 text-lg font-semibold text-neutral-50 shadow-lg shadow-neutral-950 transition duration-300 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-inner">
            Verify Email
          </Button>
        </Link>
      </div>
    );
  }

  return <QuestionForm />;
}
