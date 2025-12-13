"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import { QuestionWithDetails } from "@/models/types";

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

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-4 border-neutral-600 border-t-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between rounded-lg px-4 py-2">
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
      </div>

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
