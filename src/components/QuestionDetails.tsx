"use client";

import { QuestionWithDetails, AnswerWithDetails } from "@/models/types";
import VoteButtons from "./VoteButtons";
import { MarkdownPreview } from "./RTE";
import Link from "next/link";
import Image from "next/image";
import slugify from "@/helpers/slugify";
import convertDateToRelativeTime from "@/helpers/relativeTime";
import { storage } from "@/models/client/config";
import { ShineBorder, Modal } from "./ui";
import AnswerForm from "./AnswerForm";
import { useAuthStore } from "@/store/Auth";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { questionAttachmentBucket } from "@/models/name";
import { useState } from "react";
import UserAvatar from "./UserAvatar";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function QuestionDetails({
  question,
  answers,
}: {
  question: QuestionWithDetails;
  answers: AnswerWithDetails[];
}) {
  const { user } = useAuthStore();
  const router = useRouter();
  const isAdmin = user?.labels?.includes("admin");
  const isAuthor = user && user.$id === question.author.$id;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const deleteAnswer = async (answerId: string) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this answer?")) return;
    try {
      await axios.delete("/api/answer", {
        data: { answerId, userId: user.$id },
      });
      toast.success("Answer deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete answer", error);
      toast.error("Failed to delete answer");
    }
  };

  const getTagColor = (index: number) => {
    const colors = [
      "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30",
      "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30",
      "bg-pink-500/20 text-pink-300 hover:bg-pink-500/30",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 pb-20 text-neutral-50">
      <div className="mb-8 flex gap-4">
        <VoteButtons
          type="question"
          id={question.$id}
          totalVotes={question.totalVotes}
        />
        <div className="relative flex-1 overflow-hidden rounded-xl border border-neutral-50/10 bg-neutral-900/50 p-6 shadow-xl backdrop-blur-md">
          <ShineBorder
            className="absolute inset-0"
            shineColor={["#3B82F6", "#8B5CF6", "#EC4899", "#3B82F6"]}
          />
          <div className="mb-4 flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-neutral-50">
              {question.title}
            </h1>
            {(isAuthor || isAdmin) && (
              <Link
                href={`/questions/${question.$id}/${slugify(question.title)}/edit`}
                className="flex shrink-0 items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/50 px-4 py-1.5 text-sm font-medium text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-200"
              >
                <IconEdit size={16} />
                Edit
              </Link>
            )}
          </div>
          <div className="prose prose-invert mb-6 max-w-none">
            <MarkdownPreview
              source={question.content}
              style={{ background: "transparent", color: "inherit" }}
            />
            {question.attachmentIds && question.attachmentIds.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {question.attachmentIds.map((id) => (
                  <div
                    key={id}
                    className="relative h-24 w-24 cursor-pointer overflow-hidden rounded-md border border-neutral-700 transition hover:opacity-80"
                    onClick={() => setSelectedImage(id)}
                  >
                    <Image
                      src={storage
                        .getFileView(questionAttachmentBucket, id)
                        .toString()}
                      alt="Attachment Thumbnail"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Modal
            isOpen={!!selectedImage}
            onClose={() => setSelectedImage(null)}
            className="max-w-5xl"
          >
            {selectedImage && (
              <div className="relative h-[90vh] w-full">
                <Image
                  src={storage
                    .getFileView(questionAttachmentBucket, selectedImage)
                    .toString()}
                  alt="Full Attachment"
                  fill
                  className="rounded-xl object-contain"
                  unoptimized
                />
              </div>
            )}
          </Modal>

          <div className="mb-6 flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <Link
                key={tag}
                href={`/questions?tag=${tag}`}
                className={`rounded-full px-3 py-1 text-sm transition hover:bg-neutral-700 ${getTagColor(question.tags.indexOf(tag))}`}
              >
                {tag}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 text-sm text-neutral-400">
            <div className="flex items-center gap-2">
              <UserAvatar
                avatarId={question.author.avatarId}
                name={question.author.name}
                width={24}
                height={24}
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
            </div>
            <span suppressHydrationWarning>
              asked {convertDateToRelativeTime(new Date(question.$createdAt))}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold text-neutral-50">
          {answers.length
            ? answers.length > 1
              ? `${answers.length} Answers`
              : "1 Answer"
            : "No Answers"}
        </h2>
        <div className="flex flex-col gap-6">
          {answers.map((answer) => (
            <div key={answer.$id} className="flex gap-4">
              <VoteButtons
                type="answer"
                id={answer.$id}
                totalVotes={answer.totalVotes}
              />
              <div className="flex-1 rounded-xl border border-neutral-50/10 bg-neutral-50/5 p-6 backdrop-blur-xl">
                <div className="prose prose-invert mb-4 max-w-none">
                  <MarkdownPreview
                    source={answer.content}
                    style={{ background: "transparent", color: "inherit" }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  {user &&
                  (user.$id === answer.author.$id ||
                    user.$id === question.author.$id ||
                    isAdmin) ? (
                    <button
                      onClick={() => deleteAnswer(answer.$id)}
                      className="flex items-center gap-1 text-sm text-red-500 hover:text-red-400"
                    >
                      <IconTrash size={14} /> Delete
                    </button>
                  ) : (
                    <div />
                  )}
                  <div className="flex items-center justify-end gap-2 text-sm text-neutral-400">
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        avatarId={answer.author.avatarId}
                        name={answer.author.name}
                        width={24}
                        height={24}
                      />
                      <Link
                        href={`/users/${answer.author.$id}/${slugify(answer.author.name)}`}
                        className="text-purple-400 hover:underline"
                      >
                        {answer.author.name}
                      </Link>
                      <span className="text-neutral-500">
                        ({answer.author.reputation} rep)
                      </span>
                    </div>
                    <span suppressHydrationWarning>
                      answered{" "}
                      {convertDateToRelativeTime(new Date(answer.$createdAt))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AnswerForm questionId={question.$id} />
    </div>
  );
}
