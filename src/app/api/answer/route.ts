import { answerCollection, db, questionCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { UserPrefs } from "@/store/Auth";

export async function POST(request: NextRequest) {
  try {
    const { questionId, content, authorId } = await request.json();

    const response = await databases.createDocument(
      db,
      answerCollection,
      ID.unique(),
      {
        content,
        authorId: authorId,
        questionId: questionId,
      },
    );

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

export async function DELETE(request: NextRequest) {
  try {
    const { answerId, userId } = await request.json();

    const answer = await databases.getDocument(db, answerCollection, answerId);
    const question = await databases.getDocument(
      db,
      questionCollection,
      answer.questionId,
    );

    if (userId) {
      const user = await users.get(userId);
      if (
        answer.authorId !== userId &&
        question.authorId !== userId &&
        !user.labels.includes("admin")
      ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const response = await databases.deleteDocument(
      db,
      answerCollection,
      answerId,
    );

    const prefs = await users.getPrefs<UserPrefs>(answer.authorId);
    await users.updatePrefs<UserPrefs>(answer.authorId, {
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
