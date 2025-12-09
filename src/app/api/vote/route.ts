import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { users } from "@/models/server/config";
import { databases } from "@/models/server/config";
import { NextResponse, NextRequest } from "next/server";
import { Query } from "node-appwrite";
import { UserPrefs } from "@/store/Auth";
import { ID } from "appwrite";

export async function POST(request: NextRequest) {
  try {
    const { votedById, voteStatus, type, typeId } = await request.json();

    const response = await databases.listDocuments(db, voteCollection, [
      Query.equal("votedById", votedById),
      Query.equal("type", type),
      Query.equal("typeId", typeId),
    ]);

    if (response.documents.length > 0) {
      await databases.deleteDocument(
        db,
        voteCollection,
        response.documents[0].$id,
      );

      const QuestionOrAnswer = await databases.getDocument(
        db,
        type === "question" ? questionCollection : answerCollection,
        typeId,
      );

      const authorPrefs = await users.getPrefs<UserPrefs>(
        QuestionOrAnswer.authorId,
      );

      await users.updatePrefs<UserPrefs>(QuestionOrAnswer.authorId, {
        ...authorPrefs,
        reputation:
          response.documents[0].voteStatus === "upvoted"
            ? Number(authorPrefs?.reputation || 0) - 1
            : Number(authorPrefs?.reputation || 0) + 1,
      });
    }

    if (response.documents[0]?.voteStatus !== voteStatus) {
      const newVote = await databases.createDocument(
        db,
        voteCollection,
        ID.unique(),
        {
          type,
          typeId,
          voteStatus,
          votedById,
        },
      );

      const QuestionOrAnswer = await databases.getDocument(
        db,
        type === "question" ? questionCollection : answerCollection,
        typeId,
      );

      const authorPrefs = await users.getPrefs<UserPrefs>(
        QuestionOrAnswer.authorId,
      );

      if (response.documents[0]) {
        await users.updatePrefs<UserPrefs>(QuestionOrAnswer.authorId, {
          ...authorPrefs,
          reputation:
            voteStatus === "upvoted"
              ? Number(authorPrefs?.reputation || 0) + 1
              : Number(authorPrefs?.reputation || 0) - 1,
        });
      } else {
        await users.updatePrefs<UserPrefs>(QuestionOrAnswer.authorId, {
          ...authorPrefs,
          reputation:
            voteStatus === "upvoted"
              ? Number(authorPrefs?.reputation || 0) + 1
              : Number(authorPrefs?.reputation || 0) - 1,
        });
      }
    }

    const [upvotes, downvotes] = await Promise.all([
      databases.listDocuments(db, voteCollection, [
        Query.equal("type", type),
        Query.equal("typeId", typeId),
        Query.equal("voteStatus", "upvoted"),
        Query.equal("votedById", votedById),
        Query.limit(1),
      ]),
      databases.listDocuments(db, voteCollection, [
        Query.equal("type", type),
        Query.equal("typeId", typeId),
        Query.equal("voteStatus", "downvoted"),
        Query.equal("votedById", votedById),
        Query.limit(1),
      ]),
    ]);

    return NextResponse.json(
      {
        data: {
          document: null,
          voteResult: {
            upvotes: upvotes.total,
            downvotes: downvotes.total,
          },
        },
      },
      {
        status: 201,
      },
    );
  } catch (error: unknown) {
    const err =
      error instanceof Error ? error.message : "Internal Server Error";
    const status =
      (error as { code?: number })?.code ||
      (error as { status?: number })?.status ||
      500;

    return NextResponse.json({ error: err }, { status: status });
  }
}
