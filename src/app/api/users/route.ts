import { users } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { UserPrefs } from "@/store/Auth";

export async function PUT(request: NextRequest) {
  try {
    const { userId, name, bio, avatarId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    if (name) {
      await users.updateName(userId, name);
    }

    if (bio !== undefined || avatarId !== undefined) {
      const prefs = await users.getPrefs<UserPrefs>(userId);
      await users.updatePrefs(userId, {
        ...prefs,
        bio: bio !== undefined ? bio : prefs.bio,
        avatarId: avatarId !== undefined ? avatarId : prefs.avatarId,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
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
