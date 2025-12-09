import { users } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    const response = await users.create(
      ID.unique(),
      email,
      undefined,
      password,
      name,
    );

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
