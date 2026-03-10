/* eslint-disable @typescript-eslint/no-explicit-any */
// src/models/types.ts — update/add the question types

import type { LucideIcon } from "lucide-react";

export type QuestionType =
  | "mcq"
  | "fill_ups"
  | "true_false"
  | "long_answer"
  | "content_block";

/* ─── Base ────────────────────────────────── */
export interface BaseQuestion {
  id: string;
  sectionId: string;
  type: QuestionType;
  question: string;
  points: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/* ─── MCQ ─────────────────────────────────── */
export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MCQQuestion extends BaseQuestion {
  type: "mcq";
  data: {
    options: MCQOption[];
    shuffleOptions: boolean;
  };
}

/* ─── Fill-ups ────────────────────────────── */
export interface FillUpBlank {
  index: number;
  answer: string;
}

export interface FillUpsQuestion extends BaseQuestion {
  type: "fill_ups";
  data: {
    template: string;
    blanks: FillUpBlank[];
  };
}

/* ─── True/False ──────────────────────────── */
export interface TrueFalseQuestion extends BaseQuestion {
  type: "true_false";
  data: {
    correctAnswer: boolean;
  };
}

/* ─── Long Answer ─────────────────────────── */
export interface RubricCriterion {
  id: string;
  title: string;
  description: string;
  weight: number;
}

export interface LongAnswerQuestion extends BaseQuestion {
  type: "long_answer";
  data: {
    rubric: RubricCriterion[];
    goldenSolution: string;
  };
}

/* ─── Content Block ───────────────────────── */
export interface ContentBlockQuestion extends BaseQuestion {
  type: "content_block";
  data: {
    content: string;
    contentText: string;
  };
}

/* ─── Discriminated union ─────────────────── */
export type Question =
  | MCQQuestion
  | FillUpsQuestion
  | TrueFalseQuestion
  | LongAnswerQuestion
  | ContentBlockQuestion;

/* ─── Registry entry ──────────────────────── */
export interface QuestionTypeConfig {
  id: QuestionType;
  label: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

/* ─── API Request/Response types ──────────── */

export interface CreateQuestionRequest {
  type: QuestionType;
  question: string;
  points: number;
  data: Record<string, any>;
}

export interface CreateQuestionResponse {
  message: string;
  question: Question;
}

export interface UpdateQuestionRequest {
  type?: QuestionType;
  question?: string;
  points?: number;
  data?: Record<string, any>;
}

export interface UpdateQuestionResponse {
  message: string;
  question: Question;
}

export interface DeleteQuestionResponse {
  message: string;
}

export interface QuestionListResponse {
  questions: Question[];
}

export interface QuestionDetailResponse {
  question: Question;
}

export interface ReorderQuestionItem {
  questionId: string;
  order: number;
}

export interface ReorderQuestionsRequest {
  order: ReorderQuestionItem[];
}

export interface ReorderQuestionsResponse {
  message: string;
  questions: Question[];
}