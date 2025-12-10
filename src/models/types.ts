import { Models } from "node-appwrite";

export interface Question extends Models.Document {
  title: string;
  content: string;
  authorId: string;
  tags: string[];
  attachmentIds: string[];
}

export interface Author {
  $id: string;
  name: string;
  reputation: number;
  avatarId?: string;
}

export interface QuestionWithDetails extends Question {
  totalVotes: number;
  totalAnswers: number;
  author: Author;
}

export interface Answer extends Models.Document {
  content: string;
  questionId: string;
  authorId: string;
}

export interface AnswerWithDetails extends Answer {
  totalVotes: number;
  author: Author;
}

export interface Vote extends Models.Document {
  type: "question" | "answer";
  typeId: string;
  voteStatus: "upvoted" | "downvoted";
  votedById: string;
}
