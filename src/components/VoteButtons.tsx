"use client";

import { db, voteCollection } from "@/models/name";
import { databases } from "@/models/client/config";
import { Query } from "appwrite";
import { useAuthStore } from "@/store/Auth";
import { useEffect, useState } from "react";
import { IconCaretUpFilled, IconCaretDownFilled } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import axios from "axios";

export default function VoteButtons({
  type,
  id,
  totalVotes: initialTotalVotes,
  className,
}: {
  type: "question" | "answer";
  id: string;
  totalVotes: number;
  className?: string;
}) {
  const { user } = useAuthStore();
  const [voteStatus, setVoteStatus] = useState<"upvoted" | "downvoted" | null>(
    null,
  );
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    if (user) {
      databases
        .listDocuments(db, voteCollection, [
          Query.equal("type", type),
          Query.equal("typeId", id),
          Query.equal("votedById", user.$id),
        ])
        .then((res) => {
          if (res.documents.length > 0) {
            setVoteStatus(res.documents[0].voteStatus);
          }
        });
    }
  }, [user, type, id]);

  const handleVote = async (status: "upvoted" | "downvoted") => {
    if (!user || isVoting) {
      toast.error("Please log in to vote");
      return;
    }
    setIsVoting(true);

    const prevStatus = voteStatus;
    const prevTotal = totalVotes;

    if (status === voteStatus) {
      setVoteStatus(null);
      setTotalVotes((prev) => (status === "upvoted" ? prev - 1 : prev + 1));
    } else {
      setVoteStatus(status);
      if (prevStatus === null) {
        setTotalVotes((prev) => (status === "upvoted" ? prev + 1 : prev - 1));
      } else {
        setTotalVotes((prev) => (status === "upvoted" ? prev + 2 : prev - 2));
      }
    }

    try {
      await axios.post("/api/vote", {
        votedById: user.$id,
        voteStatus: status,
        type,
        typeId: id,
      });
    } catch {
      setVoteStatus(prevStatus);
      setTotalVotes(prevTotal);
      toast.error("Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <button
        onClick={() => handleVote("upvoted")}
        disabled={isVoting}
        className={cn(
          "rounded-full p-1 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50",
          voteStatus === "upvoted" ? "text-blue-500" : "text-neutral-400",
        )}
      >
        <IconCaretUpFilled className="h-8 w-8" />
      </button>
      <span className="text-lg font-bold text-neutral-200">{totalVotes}</span>
      <button
        onClick={() => handleVote("downvoted")}
        disabled={isVoting}
        className={cn(
          "rounded-full p-1 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50",
          voteStatus === "downvoted" ? "text-pink-500" : "text-neutral-400",
        )}
      >
        <IconCaretDownFilled className="h-8 w-8" />
      </button>
    </div>
  );
}
