import { answerCollection, db } from "@/models/name";
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
    const { answerId } = await request.json();

    const answer = await databases.getDocument(db, answerCollection, answerId);

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
