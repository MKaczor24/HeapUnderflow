import { Permission } from "node-appwrite";
import { db, questionCollection } from "../name";
import { databases } from "./config";

export default async function createQuestionCollection() {
  try {
    await databases.createCollection(
      db,
      questionCollection,
      questionCollection,
      [
        Permission.read("any"),
        Permission.read("users"),
        Permission.create("users"),
        Permission.update("users"),
        Permission.delete("users"),
      ],
    );
    console.log("Question collection is created");
  } catch {
    console.log("Question collection already exists");
  }

  await Promise.all(
    [
      databases.createStringAttribute(
        db,
        questionCollection,
        "title",
        100,
        true,
      ),
      databases.createStringAttribute(
        db,
        questionCollection,
        "content",
        10000,
        true,
      ),
      databases.createStringAttribute(
        db,
        questionCollection,
        "authorId",
        50,
        true,
      ),
      databases.createStringAttribute(
        db,
        questionCollection,
        "tags",
        50,
        true,
        undefined,
        true,
      ),
      databases.createStringAttribute(
        db,
        questionCollection,
        "attachmentIds",
        50,
        false,
        undefined,
        true,
      ),
    ].map((p) =>
      p.catch((e) => console.log("Attribute creation skipped:", e.message)),
    ),
  );

  console.log("Question Attributes created/verified");
}
