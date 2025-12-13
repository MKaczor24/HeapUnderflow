import { databases, users } from "@/models/server/config";
import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { Query } from "node-appwrite";
import { UserPrefs } from "@/store/Auth";
import { Question, QuestionWithDetails } from "@/models/types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week";

    const usersRes = await users.list<UserPrefs>([Query.limit(100)]);
    const topContributors = usersRes.users
      .sort((a, b) => (b.prefs?.reputation || 0) - (a.prefs?.reputation || 0))
      .slice(0, 10);

    let dateFilter = null;
    const now = new Date();
    if (period === "week") {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      dateFilter = Query.greaterThanEqual("$createdAt", weekAgo.toISOString());
    } else if (period === "month") {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      dateFilter = Query.greaterThanEqual("$createdAt", monthAgo.toISOString());
    }

    const queries = [Query.limit(50), Query.orderDesc("$createdAt")];
    if (dateFilter) queries.push(dateFilter);

    const questionsRes = await databases.listDocuments(
      db,
      questionCollection,
      queries,
    );

    const authorIds = [
      ...new Set(questionsRes.documents.map((doc) => doc.authorId)),
    ];
    const authorsMap = new Map();

    await Promise.all(
      authorIds.map(async (id) => {
        try {
          const author = await users.get<UserPrefs>(id);
          authorsMap.set(id, author);
        } catch {
          // Ignore errors for deleted users
        }
      }),
    );

    const questionsWithVotes = await Promise.all(
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

        const author = authorsMap.get(q.authorId) || {
          $id: "deleted",
          name: "Deleted User",
          prefs: { reputation: 0, avatarId: null },
        };

        return {
          ...q,
          totalVotes: upvotes.total - downvotes.total,
          totalAnswers: answers.total,
          author: {
            $id: author.$id,
            name: author.name,
            reputation: author.prefs?.reputation || 0,
            avatarId: author.prefs?.avatarId,
          },
        } as QuestionWithDetails;
      }),
    );

    const topQuestions = questionsWithVotes
      .sort((a, b) => b.totalVotes - a.totalVotes)
      .slice(0, 10);

    return NextResponse.json({
      topContributors,
      topQuestions,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
