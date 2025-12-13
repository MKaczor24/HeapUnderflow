"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QuestionDetails from "@/components/QuestionDetails";
import { AnswerWithDetails, QuestionWithDetails } from "@/models/types";
import { Spinner } from "@/components/ui/spinner";

export default function Page() {
  const { questionId } = useParams();

  const [question, setQuestion] = useState<QuestionWithDetails | null>(null);
  const [answers, setAnswers] = useState<AnswerWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!questionId) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/questions/${questionId}`);
        const data = await response.json();
        if (response.ok) {
          setQuestion(data.question);
          setAnswers(data.answers);
        } else {
          setError(data.error || "Failed to fetch question");
        }
      } catch (error) {
        setError("Failed to fetch question");
        console.error("Failed to fetch question data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [questionId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-neutral-400">
        {error || "Question not found"}
      </div>
    );
  }

  return <QuestionDetails question={question} answers={answers} />;
}
