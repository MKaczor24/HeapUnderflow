import { databases, users } from "@/models/server/config";
import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { Query } from "node-appwrite";
import { UserPrefs } from "@/store/Auth";
import { Answer, Question } from "@/models/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  try {
    const { questionId } = await params;

    const question = await databases.getDocument(
      db,
      questionCollection,
      questionId,
    );

    const author = await users.get(question.authorId);
    const authorPrefs = await users.getPrefs<UserPrefs>(question.authorId);

    const [upvotes, downvotes] = await Promise.all([
      databases.listDocuments(db, voteCollection, [
        Query.equal("type", "question"),
        Query.equal("typeId", questionId),
        Query.equal("voteStatus", "upvoted"),
        Query.limit(1),
      ]),
      databases.listDocuments(db, voteCollection, [
        Query.equal("type", "question"),
        Query.equal("typeId", questionId),
        Query.equal("voteStatus", "downvoted"),
        Query.limit(1),
      ]),
    ]);

    const answers = await databases.listDocuments(db, answerCollection, [
      Query.equal("questionId", questionId),
      Query.orderDesc("$createdAt"),
    ]);

    const enrichedAnswers = await Promise.all(
      answers.documents.map(async (doc) => {
        const answer = doc as unknown as Answer;
        const author = await users.get(answer.authorId);
        const authorPrefs = await users.getPrefs<UserPrefs>(answer.authorId);
        const [upvotes, downvotes] = await Promise.all([
          databases.listDocuments(db, voteCollection, [
            Query.equal("type", "answer"),
            Query.equal("typeId", answer.$id),
            Query.equal("voteStatus", "upvoted"),
            Query.limit(1),
          ]),
          databases.listDocuments(db, voteCollection, [
            Query.equal("type", "answer"),
            Query.equal("typeId", answer.$id),
            Query.equal("voteStatus", "downvoted"),
            Query.limit(1),
          ]),
        ]);

        return {
          ...answer,
          author: {
            $id: author.$id,
            name: author.name,
            reputation: authorPrefs.reputation || 0,
            avatarId: authorPrefs.avatarId,
          },
          totalVotes: upvotes.total - downvotes.total,
        };
      }),
    );

    return NextResponse.json({
      question: {
        ...(question as unknown as Question),
        author: {
          $id: author.$id,
          name: author.name,
          reputation: authorPrefs.reputation || 0,
          avatarId: authorPrefs.avatarId,
        },
        totalVotes: upvotes.total - downvotes.total,
        totalAnswers: answers.total,
      },
      answers: enrichedAnswers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch question details",
      },
      { status: 500 },
    );
  }
}
