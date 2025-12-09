"use client";

import { ShineBorder } from "./ui";
import convertDateToRelativeTime from "@/helpers/relativeTime";
import Link from "next/link";
import slugify from "@/helpers/slugify";
import { avatars } from "@/models/client/config";
import { QuestionWithDetails } from "@/models/types";
import Image from "next/image";

export default function QuestionCard({
  question,
}: {
  question: QuestionWithDetails;
}) {
  const getTagColor = (index: number) => {
    const colors = [
      "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30",
      "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30",
      "bg-pink-500/20 text-pink-300 hover:bg-pink-500/30",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="relative flex w-full flex-col items-start justify-center gap-3 overflow-hidden rounded-xl border border-neutral-50/10 bg-neutral-800 p-4 shadow-xl transition duration-300 hover:scale-105">
      <ShineBorder
        className="absolute inset-0"
        shineColor={["#3B82F6", "#8B5CF6", "#EC4899", "#3B82F6"]}
      />
      <div className="relative flex gap-4 text-sm text-neutral-400">
        <span
          className={
            question.totalVotes > 0
              ? "text-blue-400"
              : question.totalVotes < 0
                ? "text-pink-400"
                : ""
          }
        >
          {question.totalVotes} votes
        </span>
        <span className={question.totalAnswers > 0 ? "text-blue-400" : ""}>
          {question.totalAnswers} answers
        </span>
      </div>

      <Link
        className="relative text-lg font-medium text-neutral-50 transition duration-300 hover:text-purple-400 hover:underline"
        href={`/questions/${question.$id}/${slugify(question.title)}`}
      >
        {question.title}
      </Link>

      <div className="relative flex flex-wrap gap-2">
        {question.tags.map((tag: string, index: number) => (
          <Link
            key={tag}
            href={`/questions?tag=${tag}`}
            className={`rounded-md ${getTagColor(index)} px-2 py-0.5 text-sm transition duration-300`}
          >
            {tag}
          </Link>
        ))}
      </div>

      <div className="relative flex items-center gap-2 text-sm text-neutral-400">
        <Image
          src={avatars.getInitials(question.author.name, 24, 24).toString()}
          alt={question.author.name}
          width={24}
          height={24}
          className="rounded-full"
        />
        <Link
          href={`/users/${question.author.$id}/${slugify(question.author.name)}`}
          className="text-purple-400 hover:underline"
        >
          {question.author.name}
        </Link>
        <span className="text-neutral-500">
          ({question.author.reputation} rep)
        </span>
        <span className="text-neutral-500">•</span>
        <span suppressHydrationWarning>
          asked {convertDateToRelativeTime(new Date(question.$createdAt))}
        </span>
      </div>
    </div>
  );
}
