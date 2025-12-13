import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { Query } from "node-appwrite";
import { Answer, Question, QuestionWithDetails } from "@/models/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

    const user = await users.get(userId);
    const prefs = await users.getPrefs<UserPrefs>(userId);

    const [questionsRes, answersRes] = await Promise.all([
      databases.listDocuments(db, questionCollection, [
        Query.equal("authorId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(3),
      ]),
      databases.listDocuments(db, answerCollection, [
        Query.equal("authorId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(3),
      ]),
    ]);

    const questions = await Promise.all(
      questionsRes.documents.map(async (doc) => {
        const q = doc as unknown as Question;
        const [upvotes, downvotes, answers] = await Promise.all([
          databases.listDocuments(db, voteCollection, [
            Query.equal("type", "question"),
            Query.equal("typeId", q.$id),
            Query.equal("voteStatus", "upvoted"),
            Query.limit(1),
          ]),
          databases.listDocuments(db, voteCollection, [
            Query.equal("type", "question"),
            Query.equal("typeId", q.$id),
            Query.equal("voteStatus", "downvoted"),
            Query.limit(1),
          ]),
          databases.listDocuments(db, answerCollection, [
            Query.equal("questionId", q.$id),
            Query.limit(1),
          ]),
        ]);

        return {
          ...q,
          totalVotes: upvotes.total - downvotes.total,
          totalAnswers: answers.total,
          author: {
            $id: user.$id,
            name: user.name,
            reputation: prefs.reputation || 0,
            avatarId: prefs.avatarId,
          },
        } as QuestionWithDetails;
      }),
    );

    const answers = await Promise.all(
      answersRes.documents.map(async (doc) => {
        const a = doc as unknown as Answer;
        const question = await databases.getDocument(
          db,
          questionCollection,
          a.questionId,
        );
        return {
          ...a,
          question,
        };
      }),
    );

    return NextResponse.json({
      user,
      prefs,
      questions,
      answers,
      stats: {
        questions: questionsRes.total,
        answers: answersRes.total,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch user data",
      },
      { status: 500 },
    );
  }
}
