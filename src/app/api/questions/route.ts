import {
  answerCollection,
  db,
  questionAttachmentBucket,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { databases, storage, users } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import { Question, QuestionWithDetails, Author } from "@/models/types";
import { UserPrefs } from "@/store/Auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "25");
    const offset = parseInt(searchParams.get("offset") || "0");

    const queries = [
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
      Query.offset(offset),
    ];

    if (tag) {
      queries.push(Query.contains("tags", [tag]));
    }

    if (search) {
      queries.push(Query.contains("title", search));
    }

    const questionsResponse = await databases.listDocuments(
      db,
      questionCollection,
      queries,
    );

    const questions = questionsResponse.documents as unknown as Question[];

    const enrichedQuestions: QuestionWithDetails[] = await Promise.all(
      questions.map(async (question) => {
        let author: Author;
        try {
          const user = await users.get(question.authorId);
          const prefs = await users.getPrefs<UserPrefs>(question.authorId);
          author = {
            $id: user.$id,
            name: user.name,
            reputation: prefs?.reputation || 0,
            avatarId: prefs?.avatarId,
          };
        } catch {
          author = {
            $id: question.authorId,
            name: "Unknown User",
            reputation: 0,
            avatarId: undefined,
          };
        }

        const [upvotes, downvotes] = await Promise.all([
          databases.listDocuments(db, voteCollection, [
            Query.equal("type", "question"),
            Query.equal("typeId", question.$id),
            Query.equal("voteStatus", "upvoted"),
            Query.limit(1000),
          ]),
          databases.listDocuments(db, voteCollection, [
            Query.equal("type", "question"),
            Query.equal("typeId", question.$id),
            Query.equal("voteStatus", "downvoted"),
            Query.limit(1000),
          ]),
        ]);

        const totalVotes = upvotes.total - downvotes.total;

        const answers = await databases.listDocuments(db, answerCollection, [
          Query.equal("questionId", question.$id),
          Query.limit(1),
        ]);

        return {
          ...question,
          totalVotes,
          totalAnswers: answers.total,
          author,
        };
      }),
    );

    return NextResponse.json(
      {
        questions: enrichedQuestions,
        total: questionsResponse.total,
      },
      { status: 200 },
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

export async function POST(request: NextRequest) {
  try {
    const { title, content, authorId, tags, attachmentIds } =
      await request.json();

    const response = await databases.createDocument(
      db,
      questionCollection,
      ID.unique(),
      {
        title,
        content,
        authorId,
        tags,
        attachmentIds,
      },
    );

    // Increase author reputation
    const prefs = await users.getPrefs<UserPrefs>(authorId);
    await users.updatePrefs<UserPrefs>(authorId, {
      ...prefs,
      reputation: Number(prefs?.reputation || 0) + 1,
    });

    return NextResponse.json(response, { status: 201 });
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

export async function PUT(request: NextRequest) {
  try {
    const { questionId, title, content, tags, attachmentIds } =
      await request.json();

    const response = await databases.updateDocument(
      db,
      questionCollection,
      questionId,
      {
        title,
        content,
        tags,
        attachmentIds,
      },
    );

    return NextResponse.json(response, { status: 200 });
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

export async function DELETE(request: NextRequest) {
  try {
    const { questionId } = await request.json();

    const question = await databases.getDocument(
      db,
      questionCollection,
      questionId,
    );

    // 1. Delete Question Votes
    const questionVotes = await databases.listDocuments(db, voteCollection, [
      Query.equal("type", "question"),
      Query.equal("typeId", questionId),
    ]);
    await Promise.all(
      questionVotes.documents.map((doc) =>
        databases.deleteDocument(db, voteCollection, doc.$id),
      ),
    );

    // 2. Delete Answers and their Votes
    const answers = await databases.listDocuments(db, answerCollection, [
      Query.equal("questionId", questionId),
    ]);
    await Promise.all(
      answers.documents.map(async (answer) => {
        const answerVotes = await databases.listDocuments(db, voteCollection, [
          Query.equal("type", "answer"),
          Query.equal("typeId", answer.$id),
        ]);
        await Promise.all(
          answerVotes.documents.map((doc) =>
            databases.deleteDocument(db, voteCollection, doc.$id),
          ),
        );
        await databases.deleteDocument(db, answerCollection, answer.$id);
      }),
    );

    // 3. Delete Attachments
    if (question.attachmentIds && question.attachmentIds.length > 0) {
      await Promise.all(
        question.attachmentIds.map((id: string) =>
          storage.deleteFile(questionAttachmentBucket, id),
        ),
      );
    }

    // 4. Delete Question
    const response = await databases.deleteDocument(
      db,
      questionCollection,
      questionId,
    );

    // Decrease author reputation
    const prefs = await users.getPrefs<UserPrefs>(question.authorId);
    await users.updatePrefs<UserPrefs>(question.authorId, {
      ...prefs,
      reputation: Number(prefs?.reputation || 0) - 1,
    });

    return NextResponse.json(response, { status: 200 });
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
