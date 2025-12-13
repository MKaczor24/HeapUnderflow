"use client";

import RTE from "./RTE";
import { ID } from "appwrite";
import { Question } from "@/models/types";
import { Input, Button, Label, Modal } from "./ui/index";
import LabelInputContainer from "./LabelInputContainer";
import confetti from "canvas-confetti";
import slugify from "@/helpers/slugify";
import { IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { storage } from "@/models/client/config";
import { questionAttachmentBucket } from "@/models/name";
import { useAuthStore } from "@/store/Auth";
import Image from "next/image";
import axios from "axios";

export default function QuestionForm({ question }: { question?: Question }) {
  const router = useRouter();

  const { user } = useAuthStore();

  const [tag, setTag] = useState<string>("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: String(question?.title || ""),
    content: String(question?.content || ""),
    authorId: user?.$id || "",
    tags: new Set((question?.tags || []) as string[]),
    attachments: [] as File[],
    attachmentIds: (question?.attachmentIds || []) as string[],
  });

  const [loading, setLoading] = useState<boolean>(false);

  const loadConfetti = () => {
    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ["#3B82F6", "#8B5CF6", "#EC4899"],
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ["star"],
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ["circle"],
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  };

  const getTagColor = (index: number) => {
    const colors = [
      "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30",
      "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30",
      "bg-pink-500/20 text-pink-300 hover:bg-pink-500/30",
    ];
    return colors[index % colors.length];
  };

  const createQuestion = async () => {
    const attachmentIds: string[] = [];

    if (formData.attachments.length > 0) {
      const uploadPromises = formData.attachments.map((file) =>
        storage.createFile(questionAttachmentBucket, ID.unique(), file),
      );
      const responses = await Promise.all(uploadPromises);
      attachmentIds.push(...responses.map((res) => res.$id));
    }

    const documentPayload = {
      title: formData.title,
      content: formData.content,
      authorId: user!.$id,
      tags: Array.from(formData.tags),
      attachmentIds,
    };

    const response = await axios.post("/api/questions", documentPayload);
    loadConfetti();
    return response.data;
  };

  const updateQuestion = async () => {
    if (!question) {
      throw new Error("Question not found");
    }

    const attachmentIds = [...formData.attachmentIds];

    if (formData.attachments.length > 0) {
      const uploadPromises = formData.attachments.map((file) =>
        storage.createFile(questionAttachmentBucket, ID.unique(), file),
      );
      const responses = await Promise.all(uploadPromises);
      attachmentIds.push(...responses.map((res) => res.$id));
    }

    const idsToDelete = question.attachmentIds.filter(
      (id) => !formData.attachmentIds.includes(id),
    );

    if (idsToDelete.length > 0) {
      await Promise.all(
        idsToDelete.map((id) =>
          storage.deleteFile(questionAttachmentBucket, id),
        ),
      );
    }

    const updatePayload = {
      title: formData.title,
      content: formData.content,
      tags: Array.from(formData.tags),
      attachmentIds,
    };

    const response = await axios.put("/api/questions", {
      questionId: question.$id,
      ...updatePayload,
    });
    return response.data;
  };

  const deleteQuestion = async () => {
    if (!question || !user) return;

    try {
      await axios.delete("/api/questions", {
        data: { questionId: question.$id, userId: user.$id },
      });

      router.push("/questions");
      toast.success("Question deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete question");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title || !formData.content || formData.tags.size === 0) {
      toast.error("Please fill in the title, content, and tags fields first.");
      return;
    }

    if (!user || !user.$id) {
      toast.error("You must be logged in to post a question");
      return;
    }

    setLoading(true);
    const toastId = toast.loading(
      question ? "Updating your question..." : "Publishing your question...",
    );

    try {
      const response = question
        ? await updateQuestion()
        : await createQuestion();

      toast.success(
        question
          ? "Question updated successfully!"
          : "Question published successfully!",
        { id: toastId },
      );

      loadConfetti();

      router.push(
        "/questions/" + "/" + response.$id + "/" + slugify(response.title),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
        { id: toastId },
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full flex-col gap-4 p-6 text-neutral-50 md:max-w-4/5"
    >
      <LabelInputContainer>
        <Label htmlFor="title" className="text-xl font-semibold">
          Summarize your problem in a one-line title
        </Label>
        <p className="mb-4 text-sm text-neutral-300">
          Be specific, imagine you&apos;re asking a question to another person
        </p>
        <Input
          id="title"
          name="title"
          value={formData.title}
          placeholder="e.g. How do I fix error:any warning?"
          type="text"
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
        />
      </LabelInputContainer>

      <LabelInputContainer>
        <Label htmlFor="content" className="text-xl font-semibold">
          What are the details of your problem?
        </Label>
        <p className="mb-4 text-sm text-neutral-300">
          Introduce the problem and explain what you&apos;ve tried so far.
          Minimum 20 characters
        </p>
        <RTE
          value={formData.content}
          className="min-h-[220px] w-full focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-0"
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, content: value || "" }))
          }
          style={{ borderRadius: 8, overflow: "hidden", background: "#171717" }}
          textareaProps={{
            placeholder: "Write your description here...",
          }}
        />
      </LabelInputContainer>

      <div className="flex flex-col items-stretch gap-4 md:flex-row md:justify-around">
        <LabelInputContainer className="justify-start md:flex-2">
          <Label htmlFor="tags" className="text-xl font-semibold">
            Add relevant tags to your question
          </Label>
          <p className="mb-4 text-sm text-neutral-300">
            Tags help categorize your question and make it easier for others to
            find. You can add multiple tags.
          </p>
          <div>
            <div className="mb-4">
              <Input
                id="tags"
                name="tags"
                type="text"
                placeholder="e.g. Javascript, Typescript, PTC, JW"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
            </div>
            <Button
              className="z-10 mb-4 w-full max-w-xs rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 shadow-md shadow-neutral-950 transition duration-300 hover:cursor-pointer hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-inner md:w-auto"
              type="button"
              onClick={() => {
                if (tag.length === 0) return;
                setFormData((prev) => ({
                  ...prev,
                  tags: new Set(prev.tags).add(tag),
                }));
                setTag("");
              }}
            >
              Add Tag
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(formData.tags).map((tag, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="group relative inline-block rounded-full p-1 transition duration-300 hover:scale-105 hover:cursor-pointer">
                  <span className="absolute inset-0 overflow-hidden rounded-full">
                    <span className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </span>
                  <div
                    className={`relative z-10 flex items-center space-x-2 rounded-full ${getTagColor(index)} px-3 py-1 text-sm font-medium shadow-md ring-1 ring-black/20 transition duration-300`}
                  >
                    <span className="select-none">{tag}</span>
                    <Button
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          tags: new Set(
                            Array.from(prev.tags).filter((t) => t !== tag),
                          ),
                        }));
                      }}
                      type="button"
                      className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-50/10 transition duration-300 hover:bg-white/20"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <IconX size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </LabelInputContainer>

        <LabelInputContainer className="justify-start md:flex-1">
          <Label htmlFor="image" className="text-xl font-semibold">
            Attach images (Max 3)
          </Label>
          <p className="text-sm text-neutral-300">
            Upload images to help explain the issue
          </p>

          {formData.attachmentIds.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {formData.attachmentIds.map((id) => (
                <div
                  key={id}
                  className="relative h-20 w-20 overflow-hidden rounded-md border border-neutral-700"
                >
                  <Image
                    src={storage
                      .getFileView(questionAttachmentBucket, id)
                      .toString()}
                    alt="Attachment"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        attachmentIds: prev.attachmentIds.filter(
                          (aid) => aid !== id,
                        ),
                      }))
                    }
                    className="absolute top-0 right-0 flex h-6 w-6 items-center justify-center rounded-bl-md bg-red-500 text-white hover:bg-red-600"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {formData.attachments.length > 0 && (
            <div className="mb-2 flex flex-col gap-2">
              {formData.attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border border-neutral-700 bg-neutral-800 p-2"
                >
                  <span className="truncate text-sm text-neutral-300">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        attachments: prev.attachments.filter(
                          (_, i) => i !== index,
                        ),
                      }))
                    }
                    className="text-red-400 hover:text-red-300"
                  >
                    <IconX size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {formData.attachmentIds.length + formData.attachments.length < 3 && (
            <Input
              id="image"
              name="image"
              accept="image/*"
              placeholder="Upload an image"
              type="file"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;

                const currentCount =
                  formData.attachmentIds.length + formData.attachments.length;
                const newFiles = Array.from(files);

                if (currentCount + newFiles.length > 3) {
                  toast.error("You can only have a maximum of 3 attachments");
                  return;
                }

                setFormData((prev) => ({
                  ...prev,
                  attachments: [...prev.attachments, ...newFiles],
                }));

                e.target.value = "";
              }}
            />
          )}
        </LabelInputContainer>
      </div>

      <Button
        className={`z-10 w-full rounded-xl bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 px-16 py-8 text-xl shadow-md shadow-neutral-950 transition duration-300 hover:cursor-pointer hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-inner ${Array.from(formData.tags).length > 0 ? "md:h-auto" : ""}`}
        type="submit"
        disabled={loading}
      >
        {loading
          ? question
            ? "Updating..."
            : "Publishing..."
          : question
            ? "Update"
            : "Publish"}
      </Button>
      {question && (
        <Button
          className="z-10 w-full rounded-xl bg-red-500 px-16 py-4 text-xl shadow-md shadow-neutral-950 transition duration-300 hover:cursor-pointer hover:bg-red-600 hover:shadow-inner"
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          disabled={loading}
        >
          Delete
        </Button>
      )}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <h2 className="mb-4 text-xl font-bold text-neutral-100">
          Delete Question
        </h2>
        <p className="mb-6 text-neutral-300">
          Are you sure you want to delete this question? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-4">
          <Button
            onClick={() => setIsDeleteModalOpen(false)}
            className="bg-transparent text-neutral-300 hover:bg-neutral-800"
          >
            Cancel
          </Button>
          <Button
            onClick={deleteQuestion}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </form>
  );
}
