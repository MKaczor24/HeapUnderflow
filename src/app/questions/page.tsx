"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import { ShineBorder } from "@/components/ui";
import { QuestionWithDetails } from "@/models/types";
import Link from "next/link";

export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");

  const [questions, setQuestions] = useState<QuestionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (tag) params.set("tag", tag);
        if (search) params.set("search", search);

        const response = await fetch(`/api/questions?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch questions");
        }

        setQuestions(data.questions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [tag, search]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between rounded-lg bg-neutral-50/10 px-4 py-2 shadow-lg backdrop-blur-xl">
        <ShineBorder
          className="absolute inset-0"
          shineColor={["#3B82F6", "#8B5CF6", "#EC4899", "#3B82F6"]}
        />
        <div>
          <h1 className="text-3xl font-bold text-neutral-50">
            {tag ? `Questions tagged [${tag}]` : "All Questions"}
          </h1>
          {search && (
            <p className="mt-2 text-neutral-400">
              Search results for &quot;{search}&quot;
            </p>
          )}
        </div>
        <Link
          href="/questions/ask"
          className="rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-2 font-semibold text-neutral-50 shadow-neutral-950 transition duration-300 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-inner"
        >
          Ask Question
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && questions.length === 0 && (
        <div className="py-12 text-center text-neutral-400">
          <p className="text-lg">No questions found.</p>
          <p className="mt-2">Be the first to ask a question!</p>
        </div>
      )}

      {!loading && !error && questions.length > 0 && (
        <div className="flex flex-col gap-4">
          {questions.map((question) => (
            <QuestionCard key={question.$id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
}
