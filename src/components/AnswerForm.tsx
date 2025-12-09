"use client";

import { useState } from "react";
import RTE from "./RTE";
import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import { Button } from "./ui";
import { toast } from "react-hot-toast";
import axios from "axios";

export default function AnswerForm({ questionId }: { questionId: string }) {
  const [content, setContent] = useState("");
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !user) return;

    setLoading(true);
    try {
      await axios.post("/api/answer", {
        content,
        questionId,
        authorId: user.$id,
      });
      setContent("");
      toast.success("Answer posted successfully!");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to post answer");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-xl font-bold text-neutral-50">Your Answer</h3>
      <form onSubmit={handleSubmit}>
        <div data-color-mode="dark">
          <RTE
            value={content}
            onChange={(val) => setContent(val || "")}
            preview="edit"
            height={200}
            style={{
              borderRadius: 8,
              overflow: "hidden",
              background: "#171717",
            }}
            textareaProps={{
              placeholder: "Write your answer here...",
            }}
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-full border-none bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-2 text-base font-semibold text-neutral-50 shadow-md shadow-neutral-950 transition duration-300 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-inner md:w-auto"
        >
          {loading ? "Posting..." : "Post Answer"}
        </Button>
      </form>
    </div>
  );
}
