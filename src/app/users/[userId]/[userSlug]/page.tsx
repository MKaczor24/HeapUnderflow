import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { Query, Models } from "node-appwrite";
import QuestionCard from "@/components/QuestionCard";
import { Answer, Question, QuestionWithDetails } from "@/models/types";
import Link from "next/link";
import slugify from "@/helpers/slugify";
import convertDateToRelativeTime from "@/helpers/relativeTime";
import ProfileHeader from "@/components/ProfileHeader";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string; userSlug: string }>;
}) {
  const { userId } = await params;

  const user = await users.get(userId);
  const prefs = await users.getPrefs<UserPrefs>(userId);

  const [questionsRes, answersRes] = await Promise.all([
    databases.listDocuments(db, questionCollection, [
      Query.equal("authorId", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(10),
    ]),
    databases.listDocuments(db, answerCollection, [
      Query.equal("authorId", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(10),
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

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader
        user={user as unknown as Models.User<UserPrefs>}
        prefs={prefs}
        stats={{
          reputation: prefs.reputation || 0,
          questions: questionsRes.total,
          answers: answersRes.total,
        }}
      />

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-6 text-2xl font-bold text-neutral-50">
            Latest Questions
          </h2>
          <div className="flex flex-col gap-4">
            {questions.length > 0 ? (
              questions.map((question) => (
                <QuestionCard key={question.$id} question={question} />
              ))
            ) : (
              <p className="text-neutral-400">No questions asked yet.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold text-neutral-50">
            Latest Answers
          </h2>
          <div className="flex flex-col gap-4">
            {answers.length > 0 ? (
              answers.map((answer) => (
                <div
                  key={answer.$id}
                  className="relative flex flex-col gap-2 overflow-hidden rounded-xl border border-neutral-50/10 bg-neutral-800 p-4 shadow-md transition duration-300"
                >
                  <div className="mb-2 text-sm text-neutral-400">
                    Answered on{" "}
                    <Link
                      href={`/questions/${answer.question.$id}/${slugify(answer.question.title)}`}
                      className="text-purple-400 hover:underline"
                    >
                      {answer.question.title}
                    </Link>
                  </div>
                  <div
                    className="prose prose-invert line-clamp-3 max-w-none text-sm text-neutral-300"
                    dangerouslySetInnerHTML={{ __html: answer.content }}
                  />
                  <div className="mt-2 text-xs text-neutral-500">
                    <span suppressHydrationWarning>
                      {convertDateToRelativeTime(new Date(answer.$createdAt))}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-400">No answers given yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
