"use client";

import { IconCloud } from "./ui/icon-cloud";
import { AuroraText } from "./ui/aurora-text";
import { FlipWords } from "./ui/flip-words";
import { NumberTicker } from "./ui/number-ticker";
import { Button } from "./ui";
import { useAuthStore } from "@/store/Auth";
import {
  IconMessageQuestion,
  IconMessage2Check,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";

export default function HeroSectionHeader() {
  const { session } = useAuthStore();

  const slugs = [
    "typescript",
    "javascript",
    "dart",
    "java",
    "react",
    "flutter",
    "android",
    "html5",
    "css3",
    "nodedotjs",
    "express",
    "nextdotjs",
    "prisma",
    "amazonaws",
    "postgresql",
    "firebase",
    "nginx",
    "vercel",
    "testinglibrary",
    "jest",
    "cypress",
    "docker",
    "git",
    "jira",
    "github",
    "gitlab",
    "visualstudiocode",
    "androidstudio",
    "sonarqube",
    "figma",
  ];

  const flipWords = [
    "stuck?",
    "debugging?",
    "learning?",
    "building?",
    "sharing?",
    "collaborating?",
  ];

  const images = slugs.map(
    (slug) => `https://cdn.simpleicons.org/${slug}/${slug}`,
  );

  const stats = [
    {
      icon: <IconMessageQuestion className="h-6 w-6 text-blue-400" />,
      value: 10,
      suffix: "K+",
      label: "Questions",
    },
    {
      icon: <IconMessage2Check className="h-6 w-6 text-purple-400" />,
      value: 50,
      suffix: "K+",
      label: "Answers",
    },
    {
      icon: <IconUsers className="h-6 w-6 text-pink-400" />,
      value: 5,
      suffix: "K+",
      label: "Developers",
    },
  ];

  return (
    <section className="relative z-10 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-12">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500"></span>
              </span>
              Community-driven Q&A
            </div>

            <h1 className="mb-4 text-4xl leading-tight font-bold text-neutral-50 md:text-5xl lg:text-6xl">
              Got a coding problem?
              <br />
              <span className="text-neutral-300">
                <FlipWords words={flipWords} className="text-neutral-300" />
              </span>
            </h1>

            <p className="mb-8 max-w-lg text-lg text-neutral-400">
              Join thousands of developers helping each other on{" "}
              <AuroraText className="font-semibold">HeapUnderflow</AuroraText>.
              Ask questions, share knowledge, and grow together.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              {session ? (
                <Link href="/questions/ask">
                  <Button className="rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 px-8 py-6 text-lg font-semibold shadow-md shadow-neutral-950 transition duration-300 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-inner">
                    Ask Your Question
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button className="rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 px-8 py-6 text-lg font-semibold shadow-md shadow-neutral-950 transition duration-300 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-inner">
                    Get Started — It&apos;s Free
                  </Button>
                </Link>
              )}
              <Link href="/questions">
                <Button className="rounded-full border border-neutral-700 bg-neutral-900/50 px-8 py-6 text-lg font-medium text-neutral-300 shadow-neutral-950 transition duration-300 hover:border-neutral-500 hover:bg-neutral-800 hover:text-neutral-50 hover:shadow-inner">
                  Browse Questions
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 md:justify-start">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800/50">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="flex items-baseline text-2xl font-bold text-neutral-50">
                      <NumberTicker value={stat.value} />
                      <span>{stat.suffix}</span>
                    </div>
                    <div className="text-sm text-neutral-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative hidden w-full max-w-sm md:flex">
              <IconCloud images={images} />
              <div className="absolute inset-0 -z-10 items-center justify-center blur-3xl">
                <div className="h-full w-full rounded-full bg-linear-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
