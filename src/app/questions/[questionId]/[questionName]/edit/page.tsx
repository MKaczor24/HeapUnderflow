import { databases } from "@/models/server/config";
import { db, questionCollection } from "@/models/name";
import QuestionForm from "@/components/QuestionForm";
import { Question } from "@/models/types";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ questionId: string; questionName: string }>;
}) {
  const { questionId } = await params;

  const question = await databases.getDocument<Question>(
    db,
    questionCollection,
    questionId,
  );

  return <QuestionForm question={question} />;
}
