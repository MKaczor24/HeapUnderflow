"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Models } from "appwrite";
import { UserPrefs } from "@/store/Auth";
import { QuestionWithDetails } from "@/models/types";
import Link from "next/link";
import slugify from "@/helpers/slugify";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { IconArrowUp, IconMessage2 } from "@tabler/icons-react";

export default function LeaderboardPage() {
  const searchParams = useSearchParams();
  const period = searchParams.get("period") || "week";

  const [topContributors, setTopContributors] = useState<
    Models.User<UserPrefs>[]
  >([]);
  const [topQuestions, setTopQuestions] = useState<QuestionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/leaderboard?period=${period}`);
        const data = await response.json();
        if (response.ok) {
          setTopContributors(data.topContributors);
          setTopQuestions(data.topQuestions);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [period]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-4 border-neutral-600 border-t-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-neutral-50">Leaderboard</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-xl">
          <h2 className="mb-6 text-xl font-semibold text-neutral-50">
            Top Contributors
          </h2>
          <div className="flex flex-col gap-4">
            {topContributors.map((user, index) => (
              <div
                key={user.$id}
                className="flex items-center justify-between rounded-xl border border-neutral-700 bg-neutral-800/50 p-4 transition duration-300 hover:bg-neutral-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-700 font-bold text-neutral-400">
                    {index + 1}
                  </div>
                  <Link
                    href={`/users/${user.$id}/${slugify(user.name)}`}
                    className="flex items-center gap-3"
                  >
                    <UserAvatar
                      avatarId={user.prefs?.avatarId}
                      name={user.name}
                      width={40}
                      height={40}
                    />
                    <div>
                      <p className="font-medium text-neutral-50">{user.name}</p>
                      <p className="text-xs text-neutral-400">
                        Joined {new Date(user.$createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-500">
                    {user.prefs?.reputation || 0}
                  </p>
                  <p className="text-xs text-neutral-400">reputation</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-xl">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-xl font-semibold text-neutral-50">
              Top Questions
            </h2>
            <div className="flex gap-2 rounded-lg bg-neutral-800 p-1">
              <Link href="/leaderboard?period=week">
                <Button
                  variant={period === "week" ? "secondary" : "ghost"}
                  size="sm"
                  className={`${
                    period === "week"
                      ? "bg-neutral-700 text-neutral-50 shadow-sm"
                      : "text-neutral-400 hover:text-neutral-50"
                  }`}
                >
                  Week
                </Button>
              </Link>
              <Link href="/leaderboard?period=month">
                <Button
                  variant={period === "month" ? "secondary" : "ghost"}
                  size="sm"
                  className={`${
                    period === "month"
                      ? "bg-neutral-700 text-neutral-50 shadow-sm"
                      : "text-neutral-400 hover:text-neutral-50"
                  }`}
                >
                  Month
                </Button>
              </Link>
              <Link href="/leaderboard?period=all">
                <Button
                  variant={period === "all" ? "secondary" : "ghost"}
                  size="sm"
                  className={`${
                    period === "all"
                      ? "bg-neutral-700 text-neutral-50 shadow-sm"
                      : "text-neutral-400 hover:text-neutral-50"
                  }`}
                >
                  All Time
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {topQuestions.length > 0 ? (
              topQuestions.map((question, index) => (
                <div
                  key={question.$id}
                  className="flex items-start gap-4 rounded-xl border border-neutral-700 bg-neutral-800/50 p-4 transition duration-300 hover:bg-neutral-700/50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-700 font-bold text-neutral-400">
                    {index + 1}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <Link
                      href={`/questions/${question.$id}/${slugify(
                        question.title,
                      )}`}
                      className="mb-1 block truncate text-base font-medium text-neutral-50 hover:text-purple-400"
                    >
                      {question.title}
                    </Link>
                    <div className="flex items-center gap-4 text-xs text-neutral-400">
                      <div className="flex items-center gap-1">
                        <IconArrowUp className="h-3 w-3" />
                        <span>{question.totalVotes} votes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconMessage2 className="h-3 w-3" />
                        <span>{question.totalAnswers} answers</span>
                      </div>
                      <span>by {question.author.name}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-neutral-400">
                No questions found for this period.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
