"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Models } from "appwrite";
import { UserPrefs } from "@/store/Auth";
import QuestionCard from "@/components/QuestionCard";
import { Answer, Question, QuestionWithDetails } from "@/models/types";
import Link from "next/link";
import slugify from "@/helpers/slugify";
import convertDateToRelativeTime from "@/helpers/relativeTime";
import ProfileHeader from "@/components/ProfileHeader";
import { Spinner } from "@/components/ui/spinner";
import UserAvatar from "@/components/UserAvatar";

export default function ProfilePage() {
  const { userId, userSlug } = useParams();

  const [user, setUser] = useState<Models.User<UserPrefs> | null>(null);
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [questions, setQuestions] = useState<QuestionWithDetails[]>([]);
  const [answers, setAnswers] = useState<(Answer & { question: Question })[]>(
    [],
  );
  const [stats, setStats] = useState({ questions: 0, answers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!userId) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
          setPrefs(data.prefs);
          setQuestions(data.questions);
          setAnswers(data.answers);
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user || !prefs) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-neutral-400">
        User not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader
        user={user}
        prefs={prefs}
        stats={{
          reputation: prefs.reputation || 0,
          questions: stats.questions,
          answers: stats.answers,
        }}
      />

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-6 text-2xl font-bold text-neutral-50">
            Latest Questions
          </h2>
          <div className="flex flex-col gap-4">
            {questions.length > 0 ? (
              questions.map((question) => (
                <QuestionCard key={question.$id} question={question} />
              ))
            ) : (
              <p className="text-neutral-400">No questions asked yet.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold text-neutral-50">
            Latest Answers
          </h2>
          <div className="flex flex-col gap-4">
            {answers.length > 0 ? (
              answers.map((answer) => (
                <div
                  key={answer.$id}
                  className="relative flex flex-col gap-2 overflow-hidden rounded-xl border border-neutral-50/10 bg-neutral-800 p-4 shadow-md transition duration-300"
                >
                  <div className="mb-2 flex items-center gap-2 text-sm text-neutral-400">
                    <UserAvatar
                      avatarId={prefs.avatarId}
                      name={user.name}
                      width={24}
                      height={24}
                    />
                    <span>Answered on</span>
                    <Link
                      href={`/questions/${answer.question.$id}/${slugify(answer.question.title)}`}
                      className="text-purple-400 hover:underline"
                    >
                      {answer.question.title}
                    </Link>
                  </div>
                  <div
                    className="prose prose-invert line-clamp-3 max-w-none text-sm text-neutral-300"
                    dangerouslySetInnerHTML={{ __html: answer.content }}
                  />
                  <div className="mt-2 text-xs text-neutral-500">
                    <span suppressHydrationWarning>
                      {convertDateToRelativeTime(new Date(answer.$createdAt))}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-400">No answers given yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
