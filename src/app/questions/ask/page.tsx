"use client";

import QuestionForm from "@/components/QuestionForm";
import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function AskQuestionPage() {
  const { session, hydrated } = useAuthStore();
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

  return <QuestionForm />;
}
